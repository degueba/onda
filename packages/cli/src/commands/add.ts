import { resolve } from 'node:path';
import { relative } from 'node:path';
import { parseArgs, stringFlag, boolFlag } from '../lib/argv.js';
import { detectProjectShape } from '../lib/project-shape.js';
import { fetchManifest } from '../lib/manifest.js';
import { resolveTarget, safeWriteFile, type WriteOutcome } from '../lib/write.js';
import {
  detectPackageManager,
  formatInstallCommand,
} from '../lib/pkg-manager.js';

// `onda add <slug...>` — install one or more components into the user's
// project. M2 scope: happy path only.
//
//   - One or more slugs as positional args.
//   - Single-component flow per slug; no transitive registryDependencies
//     resolution yet (lands in M3).
//   - No import-path rewriting yet (lands in M4).
//   - Path-detection, conflict-detection, dry-run, force, peer-dep
//     reporting all live here from day one because they're orthogonal to
//     the dep-walking and we don't want to retrofit them later.
//
// The flow is deliberately linear:
//
//   1. Parse argv.
//   2. Detect project shape (src/ presence, paths alias).
//   3. For each slug: fetch its manifest, validate, queue its files.
//   4. Pre-flight ALL queued files: detect conflicts across the whole
//      install before writing anything.
//   5. If any conflicts and not --force: abort, print the list, exit 1.
//   6. Otherwise: write everything, collecting outcomes.
//   7. Print a summary + peer-dep install line.

const DEFAULT_REGISTRY = 'https://onda.dev/r';

type AddOptions = {
  slugs: string[];
  componentsOut: string;
  libOut: string;
  registry: string;
  force: boolean;
  dryRun: boolean;
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
    process.stderr.write('onda add: missing component slug\n');
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

  // Step 1 — fetch + validate each manifest, queue its files for write.
  // Failures here are per-slug; we collect all errors before exiting so a
  // user with two bad slugs sees both, not just the first.
  const queue: QueuedFile[] = [];
  const peerDeps = new Set<string>();
  const fetchErrors: string[] = [];

  for (const slug of opts.slugs) {
    const url = `${opts.registry.replace(/\/$/, '')}/${slug}.json`;
    try {
      const manifest = await fetchManifest(url);
      for (const file of manifest.files) {
        const destination = resolveTarget(
          file.target,
          componentsOut,
          libOut,
          cwd,
        );
        queue.push({
          slug,
          destination,
          content: file.content,
          relativeForLog: relative(cwd, destination),
        });
      }
      if (manifest.dependencies) {
        for (const dep of manifest.dependencies) peerDeps.add(dep);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown error';
      fetchErrors.push(`  ${slug}: ${message}`);
    }
  }

  if (fetchErrors.length > 0) {
    process.stderr.write('onda add: failed to fetch one or more manifests:\n');
    process.stderr.write(`${fetchErrors.join('\n')}\n`);
    process.exit(1);
  }

  // Step 2 — pre-flight conflict scan. We pass force=false and dryRun=true
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

  // Step 3 — real write pass (or dry-run, if the user asked for it).
  // `--dry-run` doesn't touch disk; the `conflict` cases here are now
  // impossible because either there were none, or the user passed --force
  // (which lets safeWriteFile overwrite).
  const outcomes = queue.map((q) =>
    safeWriteFile(q.destination, q.content, {
      force: opts.force,
      dryRun: opts.dryRun,
    }),
  );

  // Step 4 — print a per-file summary, then the peer-dep block.
  printPlanSummary(queue, outcomes, opts);

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
    componentsOut: parsed.flags['components-out'] === true ? '' : String(parsed.flags['components-out'] ?? ''),
    libOut: parsed.flags['lib-out'] === true ? '' : String(parsed.flags['lib-out'] ?? ''),
    registry: stringFlag(parsed.flags, 'registry', DEFAULT_REGISTRY),
    force: boolFlag(parsed.flags, 'force'),
    dryRun: boolFlag(parsed.flags, 'dry-run'),
  };
}

function printPlanSummary(
  queue: QueuedFile[],
  outcomes: WriteOutcome[],
  opts: AddOptions,
): void {
  // Group output by slug so a multi-slug install reads cleanly. Within
  // each slug, sort files lexicographically — predictable for diffs and
  // for human eyes.
  const bySlug = new Map<string, { queued: QueuedFile; outcome: WriteOutcome }[]>();
  for (let i = 0; i < queue.length; i++) {
    const q = queue[i];
    const o = outcomes[i];
    const arr = bySlug.get(q.slug) ?? [];
    arr.push({ queued: q, outcome: o });
    bySlug.set(q.slug, arr);
  }

  for (const [slug, entries] of bySlug) {
    process.stdout.write(`${opts.dryRun ? '[dry-run] ' : ''}${slug}\n`);
    entries.sort((a, b) => a.queued.relativeForLog.localeCompare(b.queued.relativeForLog));
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
