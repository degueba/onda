// Minimal argv parser. Hand-rolled to keep the CLI dependency-free.
//
// Supports:
//   --flag                 → boolean true
//   --key value            → string
//   --key=value            → string
//   positional args        → collected separately
//
// Does NOT support:
//   -short flags           → we use long forms only for readability
//   --no-flag negation     → `--no-color` is the one boolean we accept and we
//                           handle it as a literal flag name, not a negator.
//
// Why hand-rolled: commander/yargs adds 50-200 kB to the published bundle
// for a surface this small. We can revisit if the flag set grows.

export type ParsedArgs = {
  /** Positional arguments, in order, after any flags are stripped. */
  positional: string[];
  /** Flag → string value (or true for boolean flags). */
  flags: Record<string, string | true>;
};

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq !== -1) {
        // --key=value form
        const key = arg.slice(2, eq);
        const value = arg.slice(eq + 1);
        flags[key] = value;
        i++;
        continue;
      }

      const key = arg.slice(2);
      const next = argv[i + 1];
      // If the next token exists and isn't another flag, treat it as the
      // value. Otherwise this is a boolean flag.
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
      continue;
    }

    positional.push(arg);
    i++;
  }

  return { positional, flags };
}

/**
 * Pull a string-valued flag with a default. Throws if the flag was passed as
 * a bare boolean (e.g. `--registry` with no following value) — that's almost
 * always a user typo and we'd rather error than silently use the default.
 */
export function stringFlag(
  flags: Record<string, string | true>,
  key: string,
  fallback: string,
): string {
  const v = flags[key];
  if (v === undefined) return fallback;
  if (v === true) {
    throw new Error(`flag --${key} expects a value`);
  }
  return v;
}

/** Read a boolean flag — true iff present (regardless of any string value). */
export function boolFlag(
  flags: Record<string, string | true>,
  key: string,
): boolean {
  return flags[key] !== undefined;
}
