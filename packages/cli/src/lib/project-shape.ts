import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Detects the user's project layout so the CLI can pick sensible defaults
// for where component folders and shared lib helpers land. Two things
// matter:
//
//   1. Does `./src/` exist? Then we prefer src-rooted defaults.
//   2. Does `./tsconfig.json` declare a `paths["@/*"]` alias pointing inside
//      the source tree? Then we can rewrite imports to use the alias (M4)
//      instead of computing relative paths.
//
// Both reads are cheap and synchronous — this runs once per invocation,
// before any disk writes.

export type ProjectShape = {
  /** Absolute path to the project root the CLI is operating in. */
  cwd: string;
  /** True iff `<cwd>/src/` exists and is a directory. */
  hasSrcDir: boolean;
  /** Resolved `paths["@/*"]` target (e.g. "./src/*") if declared, else null. */
  pathsAlias: string | null;
  /** Default `--components-out` if the user didn't pass one. */
  defaultComponentsOut: string;
  /** Default `--lib-out` if the user didn't pass one. */
  defaultLibOut: string;
};

export function detectProjectShape(cwd: string): ProjectShape {
  const hasSrcDir = existsSync(resolve(cwd, 'src'));

  const pathsAlias = readPathsAlias(cwd);

  const componentsRoot = hasSrcDir
    ? resolve(cwd, 'src/components/onda')
    : resolve(cwd, 'components/onda');
  const libRoot = hasSrcDir
    ? resolve(cwd, 'src/lib/onda')
    : resolve(cwd, 'lib/onda');

  return {
    cwd,
    hasSrcDir,
    pathsAlias,
    defaultComponentsOut: componentsRoot,
    defaultLibOut: libRoot,
  };
}

/**
 * Read `tsconfig.json` and return the `paths["@/*"]` target if it exists.
 * Tolerant of:
 *   - missing tsconfig (returns null)
 *   - tsconfig with no `compilerOptions.paths` (returns null)
 *   - JSONC comments / trailing commas (uses a small strip pass instead of
 *     pulling in jsonc-parser as a dep)
 *
 * Returns the first array entry under `paths["@/*"]` verbatim. Doesn't
 * resolve it against the project root — callers do that.
 */
function readPathsAlias(cwd: string): string | null {
  const tsconfigPath = resolve(cwd, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) return null;

  let raw: string;
  try {
    raw = readFileSync(tsconfigPath, 'utf8');
  } catch {
    return null;
  }

  // Strip // line comments and /* block comments */, plus trailing commas
  // before } or ]. Same pragmatic approach the shadcn CLI uses. Not a real
  // JSONC parser — good enough for the tsconfig.json shapes we see in
  // practice (Next.js / Vite scaffolds, Remotion starter, hand-rolled).
  const stripped = raw
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[\]}])/g, '$1');

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const compilerOptions = (parsed as { compilerOptions?: unknown })
    .compilerOptions;
  if (typeof compilerOptions !== 'object' || compilerOptions === null) {
    return null;
  }
  const paths = (compilerOptions as { paths?: unknown }).paths;
  if (typeof paths !== 'object' || paths === null) return null;
  const atSlashStar = (paths as Record<string, unknown>)['@/*'];
  if (!Array.isArray(atSlashStar) || atSlashStar.length === 0) return null;

  const first = atSlashStar[0];
  return typeof first === 'string' ? first : null;
}
