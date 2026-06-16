import { resolve, relative } from 'node:path';
import { parseArgs, stringFlag, boolFlag } from '../lib/argv.js';
import { detectProjectShape } from '../lib/project-shape.js';
import { resolveTransitive } from '../lib/resolve.js';
import { resolveTarget, safeWriteFile, type WriteOutcome } from '../lib/write.js';
import { rewriteImports } from '../lib/rewrite-imports.js';
import {
  detectPackageManager,
  formatInstallCommand,
} from '../lib/pkg-manager.js';
import { updateBarrel, formatBarrelOutcome } from '../lib/barrel.js';

// `onda add <slug...>` — install one or more components into the user's
// project.
//
//   - One or more slugs as positional args.
//   - Transitive registryDependencies resolution: lib helpers and any
//     sibling primitives a scene block composes are installed in one pass,
//     deduped, in topological order (deps printed first).
//   - Import-path rewriting lands in M4.
//
// The flow stays linear:
//
//   1. Parse argv.
//   2. Detect project shape (src/ presence, paths alias).
//   3. Resolve the full transitive set of manifests; queue every file.
//   4. Pre-flight ALL queued files: detect conflicts across the whole
//      install before writing anything.
//   5. If any conflicts and not --force: abort, print the list, exit 1.
//   6. Otherwise: write everything, collecting outcomes.
//   7. Print a per-slug summary + the peer-dep install line.

const DEFAULT_REGISTRY = 'https://remotion.onda.video/r';

type AddOptions = {
  slugs: string[];
  componentsOut: string;
  libOut: string;
  registry: string;
  force: boolean;
  dryRun: boolean;
  noBarrel: boolean;
};

type QueuedFile = {
  slug: string;
  destination: string;
  content: string;
  relativeForLog: string;
};

export async function runAdd(args: string[]): Promise<void> {
  const opts = parseAddArgs(args);

  if (opts.slugs.length === 0) {
    process.stderr.write('ondajs add: missing component slug\n');
    process.stderr.write('  usage: onda add <slug...>\n');
    process.exit(1);
  }

  const cwd = process.cwd();
  const shape = detectProjectShape(cwd);

  // The resolved out-paths: explicit flag value wins, else the detected default.
  const componentsOut = opts.componentsOut
    ? resolve(cwd, opts.componentsOut)
    : shape.defaultComponentsOut;
  const libOut = opts.libOut
    ? resolve(cwd, opts.libOut)
    : shape.defaultLibOut;

  // Step 1 — walk the dep graph. resolveTransitive returns the manifests
  // in topological order (deps first) so when we render the per-slug
  // summary later, the user sees lib-motion / primitives BEFORE the scene
  // block that asked for them.
  let resolved;
  try {
    resolved = await resolveTransitive(opts.slugs, opts.registry);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    process.stderr.write(`onda add: ${message}\n`);
    process.exit(1);
  }

  // Step 2 — queue every file from every resolved manifest. Peer deps
  // collect into a single Set so the final install line is deduped.
  const queue: QueuedFile[] = [];
  const peerDeps = new Set<string>();

  for (const { manifest } of resolved) {
    for (const file of manifest.files) {
      const destination = resolveTarget(
        file.target,
        componentsOut,
        libOut,
        cwd,
      );
      // Rewrite import specifiers in TS/TSX files so the installed code
      // points at the user's lib/onda + components/onda layout (either via
      // their @/* alias or via a computed relative path). Non-TS files
      // (README, JSON) pass through untouched.
      const isCode = /\.(tsx?|jsx?)$/.test(file.path);
      const content = isCode
        ? rewriteImports(file.content, {
            filePath: destination,
            componentsOut,
            libOut,
            shape,
          })
        : file.content;
      queue.push({
        slug: manifest.name,
        destination,
        content,
        relativeForLog: relative(cwd, destination),
      });
    }
    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) peerDeps.add(dep);
    }
  }

  // Step 3 — pre-flight conflict scan. We pass force=false and dryRun=true
  // here regardless of the user's flags: we just want to *see* what would
  // conflict, without writing. The real write pass uses the user's flags.
  const scanOutcomes = queue.map((q) =>
    safeWriteFile(q.destination, q.content, { force: false, dryRun: true }),
  );
  const conflicts = scanOutcomes.filter(
    (o): o is Extract<WriteOutcome, { kind: 'conflict' }> =>
      o.kind === 'conflict',
  );

  if (conflicts.length > 0 && !opts.force) {
    process.stderr.write(
      `onda add: ${conflicts.length} destination ` +
        `${conflicts.length === 1 ? 'file already exists' : 'files already exist'} ` +
        `with different content. Re-run with --force to overwrite,\n` +
        `or with --dry-run to see the full plan:\n`,
    );
    for (const c of conflicts) {
      process.stderr.write(`  ${relative(cwd, c.path)}\n`);
    }
    process.exit(1);
  }

  // Step 4 — real write pass (or dry-run). `--dry-run` doesn't touch
  // disk; the `conflict` cases here are now impossible because either
  // there were none, or the user passed --force.
  const outcomes = queue.map((q) =>
    safeWriteFile(q.destination, q.content, {
      force: opts.force,
      dryRun: opts.dryRun,
    }),
  );

  // Step 5 — print a per-file summary, then the peer-dep block.
  printPlanSummary(queue, outcomes, opts);

  // Step 6 — update the barrel + sidecar so consumers can `import { ondaRegistry }`
  // and pass it directly to `<CompositionRenderer registry={...}>`. Skipped by
  // --no-barrel; refuses to clobber a foreign (non-CLI-managed) barrel.
  if (!opts.noBarrel) {
    // Both components and transitions ship as `registry:component` in
    // the registry JSON — the discriminator is the file target. A
    // transition's first file lands at `components/onda/transitions/…`,
    // a component's at `components/onda/<slug>/…`. We split here so
    // the barrel can emit two registries with the right shapes.
    const installable = resolved.filter(
      ({ manifest }) => manifest.type === 'registry:component',
    );
    const componentSlugs: string[] = [];
    const transitionSlugs: string[] = [];
    for (const { manifest } of installable) {
      const firstTarget = manifest.files?.[0]?.target ?? '';
      if (firstTarget.includes('/transitions/')) {
        transitionSlugs.push(manifest.name);
      } else {
        componentSlugs.push(manifest.name);
      }
    }

    const barrelOutcome = updateBarrel(componentsOut, componentSlugs, transitionSlugs, {
      dryRun: opts.dryRun,
      cwd,
    });
    const line = formatBarrelOutcome(barrelOutcome, cwd, opts.dryRun);
    if (line) {
      process.stdout.write('\n');
      process.stdout.write(line + '\n');
    }
  }

  if (peerDeps.size > 0) {
    const pm = detectPackageManager(cwd);
    const sorted = [...peerDeps].sort();
    process.stdout.write('\n');
    process.stdout.write(
      'Install peer dependencies (this CLI does not install them for you):\n',
    );
    process.stdout.write(`  ${formatInstallCommand(pm, sorted)}\n`);
  }

  if (opts.dryRun) {
    process.stdout.write('\n(dry run — no files were written)\n');
  }
}

function parseAddArgs(args: string[]): AddOptions {
  const parsed = parseArgs(args);
  return {
    slugs: parsed.positional,
    componentsOut:
      parsed.flags['components-out'] === true
        ? ''
        : String(parsed.flags['components-out'] ?? ''),
    libOut:
      parsed.flags['lib-out'] === true
        ? ''
        : String(parsed.flags['lib-out'] ?? ''),
    registry: stringFlag(parsed.flags, 'registry', DEFAULT_REGISTRY),
    force: boolFlag(parsed.flags, 'force'),
    dryRun: boolFlag(parsed.flags, 'dry-run'),
    noBarrel: boolFlag(parsed.flags, 'no-barrel'),
  };
}

function printPlanSummary(
  queue: QueuedFile[],
  outcomes: WriteOutcome[],
  opts: AddOptions,
): void {
  // Group output by slug so a multi-slug / transitive install reads cleanly.
  // Within each slug, sort files lexicographically — predictable for diffs
  // and for human eyes. Iteration over the Map preserves insertion order
  // which is topological (lib-* first, then primitives, then scene blocks).
  const bySlug = new Map<
    string,
    { queued: QueuedFile; outcome: WriteOutcome }[]
  >();
  for (let i = 0; i < queue.length; i++) {
    const q = queue[i];
    const o = outcomes[i];
    const arr = bySlug.get(q.slug) ?? [];
    arr.push({ queued: q, outcome: o });
    bySlug.set(q.slug, arr);
  }

  for (const [slug, entries] of bySlug) {
    process.stdout.write(`${opts.dryRun ? '[dry-run] ' : ''}${slug}\n`);
    entries.sort((a, b) =>
      a.queued.relativeForLog.localeCompare(b.queued.relativeForLog),
    );
    for (const { queued, outcome } of entries) {
      const verb =
        outcome.kind === 'written'
          ? opts.dryRun
            ? 'would write'
            : 'wrote'
          : outcome.kind === 'unchanged'
          ? 'unchanged'
          : 'CONFLICT';
      process.stdout.write(`  ${verb}  ${queued.relativeForLog}\n`);
    }
  }
}
