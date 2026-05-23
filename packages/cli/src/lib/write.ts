import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, basename, resolve } from 'node:path';

// Disk-write helpers for the install step. Two responsibilities:
//
//   1. Conflict detection — never silently overwrite a file with different
//      content. If the destination already has the EXACT same content,
//      we treat that as a no-op (idempotent re-install). If content differs,
//      refuse unless --force.
//   2. Atomic-ish writes — create parent directories on demand; write via
//      `writeFileSync` which is fine at this scale (we're writing small
//      text files, not large binaries).

export type WriteOutcome =
  | { kind: 'written'; path: string }
  | { kind: 'unchanged'; path: string }
  | { kind: 'conflict'; path: string };

/**
 * Write `content` to `absPath`, creating parent directories as needed.
 *
 * Returns:
 *   - `written` if the file was newly created or overwritten.
 *   - `unchanged` if the destination already had identical content.
 *   - `conflict` if the destination exists with different content AND
 *     `force` was false. The caller is responsible for surfacing this to
 *     the user; we don't throw because we want to collect ALL conflicts
 *     across a multi-file install and report them together.
 */
export function safeWriteFile(
  absPath: string,
  content: string,
  options: { force: boolean; dryRun: boolean },
): WriteOutcome {
  if (existsSync(absPath)) {
    const existing = readFileSync(absPath, 'utf8');
    if (existing === content) {
      return { kind: 'unchanged', path: absPath };
    }
    if (!options.force) {
      return { kind: 'conflict', path: absPath };
    }
  }

  if (options.dryRun) {
    return { kind: 'written', path: absPath };
  }

  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content, 'utf8');
  return { kind: 'written', path: absPath };
}

/**
 * Compute the absolute filesystem destination for one manifest file entry.
 *
 * Manifests describe targets like `components/onda/<slug>/BlurReveal.tsx`.
 * The CLI rewrites those targets so that the `components/onda/...` prefix
 * is replaced with the user's `--components-out` directory, and similarly
 * `lib/onda/...` → `--lib-out`.
 *
 * The rewriting is deliberately literal — manifests authored against the
 * default install paths just work; the CLI's job is the redirect, not a
 * general path-translation engine. If a manifest carries a target that
 * doesn't match either prefix, we fall back to writing it relative to
 * cwd, since the manifest author presumably knew what they were doing.
 */
export function resolveTarget(
  manifestTarget: string,
  componentsOut: string,
  libOut: string,
  cwd: string,
): string {
  // `components/onda/<slug>/<file>` → `<componentsOut>/<slug>/<file>`
  const componentsPrefix = 'components/onda/';
  if (manifestTarget.startsWith(componentsPrefix)) {
    const rest = manifestTarget.slice(componentsPrefix.length);
    return resolve(componentsOut, rest);
  }

  // `lib/onda/<file>` → `<libOut>/<file>`
  const libPrefix = 'lib/onda/';
  if (manifestTarget.startsWith(libPrefix)) {
    const rest = manifestTarget.slice(libPrefix.length);
    return resolve(libOut, rest);
  }

  // Fall back to cwd-relative. We keep only the file's basename so the
  // file doesn't end up nested in unexpected directories under cwd.
  return resolve(cwd, basename(manifestTarget));
}
