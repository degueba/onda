import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Detect which package manager the user's project is using, by lockfile
// presence. We print the matching `<pm> add <peer-deps>` line at the end
// of `onda add` so the user can copy-paste — we deliberately never invoke
// the package manager ourselves.
//
// Resolution order is "most-recently-popular first":
//   pnpm → yarn → bun → npm (default fallback).
//
// If no lockfile is present at the project root we fall back to npm — it
// works for everyone, even if it's not their personal default.

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(resolve(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(resolve(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

/**
 * Build the user-facing install command line for a list of peer dependencies.
 * Returns a string like `pnpm add remotion zod react` — ready to paste.
 */
export function formatInstallCommand(
  pm: PackageManager,
  deps: string[],
): string {
  const verb = pm === 'npm' ? 'install' : 'add';
  return `${pm} ${verb} ${deps.join(' ')}`;
}
