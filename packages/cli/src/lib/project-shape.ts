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

  const stripped = stripJsonc(raw);

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

// Strip JSONC features (line comments, block comments, trailing commas) from
// the input so `JSON.parse` accepts it. Walks the source character-by-character
// so we never confuse glob patterns inside JSON strings (the include array's
// "src" + double-star + slash) with comment markers. The regex-based version
// of this function broke on the very common Next.js / Vite "include" shape.
//
// Not a general JSONC parser — output retains string contents byte-for-byte;
// only ECMA-flavored comments and trailing commas are removed.
function stripJsonc(input: string): string {
  let out = '';
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i];

    // Inside a string: copy everything verbatim until the closing quote,
    // honoring \" and \\ escapes. Comments and trailing commas inside
    // strings are NOT special.
    if (ch === '"') {
      out += ch;
      i++;
      while (i < n) {
        const c = input[i];
        out += c;
        i++;
        if (c === '\\' && i < n) {
          out += input[i];
          i++;
          continue;
        }
        if (c === '"') break;
      }
      continue;
    }

    // Line comment: skip to the next newline (keep the newline so line
    // numbers stay stable for any error messages).
    if (ch === '/' && input[i + 1] === '/') {
      i += 2;
      while (i < n && input[i] !== '\n') i++;
      continue;
    }

    // Block comment: skip to the next `*/`. Don't preserve content.
    if (ch === '/' && input[i + 1] === '*') {
      i += 2;
      while (i < n && !(input[i] === '*' && input[i + 1] === '/')) i++;
      i += 2; // skip the closing */
      continue;
    }

    // Trailing comma before `]` or `}`: drop the comma.
    if (ch === ',') {
      let j = i + 1;
      while (j < n && /\s/.test(input[j])) j++;
      if (j < n && (input[j] === ']' || input[j] === '}')) {
        i++;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}
