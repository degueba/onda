#!/usr/bin/env node
// Bundle src/motion.ts → dist/motion.js via esbuild + emit .d.ts via tsc, then
// trampoline out via dist/motion.d.ts. Same shape as build-manifest.mjs.
//
// The motion lib (../../../lib/{choreography,motion,easing}) imports from
// `remotion` (springs / interpolate) and is meant for React/Remotion hosts, so
// react + remotion are marked external here and declared as peerDependencies —
// the consumer (the studio, backend/remotion) brings them. The `.`/`./manifest`
// entry stays pure-Zod; only `./motion` carries the react/remotion contract.

import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });

await build({
  entryPoints: ['src/motion.ts'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: 'dist/motion.js',
  external: [
    'react',
    'react-dom',
    'remotion',
    '@remotion/transitions',
    '@remotion/media-utils',
    '@remotion/paths',
  ],
  legalComments: 'none',
});

// Emit declarations (tsc walks everything reachable from src/motion.ts; output
// mirrors the repo layout under dist/types/).
execSync('tsc -p tsconfig.motion.json', { stdio: 'inherit' });

// Trampoline so the public types path stays dist/motion.d.ts.
writeFileSync(
  'dist/motion.d.ts',
  `export * from './types/packages/cli/src/motion';
`,
);

console.log('build-motion: bundled dist/motion.js + emitted .d.ts under dist/types/');
