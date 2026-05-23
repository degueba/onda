#!/usr/bin/env node
// Entry point for the `onda` binary. TypeScript preserves the shebang on
// the first line so the compiled dist/onda.js runs directly under Node
// once npm sets the executable bit via the package.json `bin` field.
//
// Argv parsing is intentionally hand-rolled — the surface is small enough
// (two commands, a handful of flags) that pulling in commander/yargs would
// add weight for no gain. Each command receives its own raw args slice and
// parses its own flags in its own module.

import { createRequire } from 'node:module';
import { HELP_TEXT } from './help.js';
import { runAdd } from './commands/add.js';
import { runList } from './commands/list.js';

// `package.json` sits one level up from this file at runtime
// (dist/onda.js → ../package.json). Reading it via createRequire instead of
// a static `import … with { type: 'json' }` keeps tsc's rootDir clean
// (./src), so the build output lands flat at dist/onda.js rather than
// dist/src/onda.js. Negligible startup cost and the require resolves only
// when --version or --help asks for the version string.
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // No-args invocation prints help and exits 0 — the friendliest default for
  // someone typing `npx onda` to see what's available.
  if (argv.length === 0) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  // Global flags are only recognized in the FIRST position so that command
  // handlers stay in control of their own `--help` / `--version` semantics.
  // (Today neither uses them; this just leaves room.)
  const first = argv[0];

  if (first === '--help' || first === '-h') {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (first === '--version' || first === '-v') {
    process.stdout.write(`${pkg.version}\n`);
    return;
  }

  const [command, ...rest] = argv;

  switch (command) {
    case 'add':
      await runAdd(rest);
      return;
    case 'list':
      await runList(rest);
      return;
    default:
      process.stderr.write(`onda: unknown command "${command}"\n\n`);
      process.stderr.write(HELP_TEXT);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  // Last-resort error handler. Command handlers should print their own
  // human-readable errors and exit; this catches genuine programming
  // mistakes (uncaught throws inside async handlers) so the user at least
  // sees something useful instead of an unhandled-rejection stack.
  const message =
    err instanceof Error ? err.message : 'an unknown error occurred';
  process.stderr.write(`onda: ${message}\n`);
  if (process.env.ONDA_DEBUG && err instanceof Error && err.stack) {
    process.stderr.write(`${err.stack}\n`);
  }
  process.exit(1);
});
