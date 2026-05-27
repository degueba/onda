#!/usr/bin/env node
// Bundle src/manifest.ts → dist/manifest.js via esbuild + emit per-schema
// .d.ts files via tsc, then trampoline them out via dist/manifest.d.ts.
//
// Why esbuild and not tsc for the JS: the manifest module imports
// component schemas from ../../../registry/components/*/schema.ts, which
// live OUTSIDE the CLI package's rootDir. tsc would either need rootDir
// relaxation (messy dist tree) or per-file compile-out-of-dir (broken
// import resolution). esbuild bundles into a single file, so the
// published dist is just one self-contained module per entry point.
//
// Why tsc for the .d.ts (changed in #52): the `schemas` map relies on
// per-key Zod schema types being preserved through `typeof` so consumers
// can do `z.infer<typeof schemas['quote-card']>` and recover the real
// props shape. A hand-authored .d.ts would force us to re-mirror every
// schema's structural type — exactly the boilerplate the manifest export
// was supposed to eliminate. tsc-emitted declarations preserve every
// schema's full type for free.
//
// `zod`, `react`, and `remotion` are marked external in the esbuild
// pass — the manifest only needs zod at runtime (the schemas are pure
// Zod objects); react / remotion appear in transitively-imported
// component .tsx files but their symbols are never invoked by the
// manifest's API surface, so tree-shaking should drop them. Leaving them
// external guarantees we don't accidentally bundle either runtime into a
// metadata-only module.

import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });

await build({
  entryPoints: ['src/manifest.ts'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: 'dist/manifest.js',
  external: [
    'zod',
    'react',
    'react-dom',
    'remotion',
    '@remotion/transitions',
    '@remotion/media-utils',
    '@remotion/paths',
  ],
  legalComments: 'none',
});

// Emit per-schema .d.ts files under dist/types/ so the public
// dist/manifest.d.ts can re-export the typed `schemas` map without
// losing per-key inference. tsc walks every schema reachable from
// src/manifest.ts; output paths mirror the repo layout under
// dist/types/ (e.g. dist/types/packages/cli/src/manifest.d.ts).
execSync('tsc -p tsconfig.manifest.json', { stdio: 'inherit' });

// Trampoline so the public types path stays `dist/manifest.d.ts` — the
// same path consumers already resolve via package.json "types". This
// keeps a stable, shallow entry point regardless of where tsc places
// the generated declarations internally.
writeFileSync(
  'dist/manifest.d.ts',
  `export * from './types/packages/cli/src/manifest';
export { default } from './types/packages/cli/src/manifest';
`,
);

console.log(
  'build-manifest: bundled dist/manifest.js + emitted per-schema .d.ts under dist/types/',
);
