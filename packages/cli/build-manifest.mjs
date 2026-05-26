#!/usr/bin/env node
// Bundle src/manifest.ts → dist/manifest.js via esbuild.
//
// Why esbuild and not tsc: the manifest module imports component
// schemas from ../../../registry/components/*/schema.ts, which live
// OUTSIDE the CLI package's rootDir. tsc would either need rootDir
// relaxation (messy dist tree) or per-file compile-out-of-dir
// (broken import resolution). esbuild bundles into a single file, so
// the published dist is just one self-contained module per entry
// point.
//
// `zod`, `react`, and `remotion` are marked external — the manifest
// only needs zod at runtime (the schemas are pure Zod objects);
// react / remotion appear in transitively-imported component .tsx
// files but their symbols are never invoked by the manifest's API
// surface, so tree-shaking should drop them. Leaving them external
// guarantees we don't accidentally bundle either runtime into a
// metadata-only module.

import { build } from 'esbuild';
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

// Hand-author the .d.ts alongside the bundle. esbuild doesn't emit
// type declarations, and the manifest's public type surface is small
// and stable enough that a generator would be more code than this.
writeFileSync(
  'dist/manifest.d.ts',
  `import type { z } from 'zod';

export type ComponentManifestEntry = {
  /** Slug — matches the registry folder name. Use as the dispatch key. */
  name: string;
  /** Category from the entry's meta.json (e.g. 'entrances', 'scenes',
   *  'data', 'transitions'). Filter by this to separate components
   *  from transitions. */
  category: string;
  /** PascalCase display name for components, camelCase for transitions. */
  title: string;
  /** One-paragraph description — same string the catalog shows. */
  description: string;
  /** Real Zod schema. Use \`.parse()\`, \`.extend()\`, or pipe directly
   *  into a \`z.discriminatedUnion\`. */
  schema: z.ZodTypeAny;
  /** One sentence — when to pick this over its near-neighbors. Authored
   *  alongside \`description\` in meta.json; ≤140 chars by convention
   *  so it survives prompt truncation. Optional (techspec 027). */
  pickWhen?: string;
  /** Slugs this entry composes from — populated only for scene blocks
   *  and other composing entries. Build-time validated against the
   *  manifest (techspec 027). */
  composes?: ReadonlyArray<string>;
  /** Reserved for future v1.1. Empty today. */
  examples?: ReadonlyArray<{
    name: string;
    description?: string;
    props: Record<string, unknown>;
  }>;
};

export const manifest: ReadonlyArray<ComponentManifestEntry>;
export default manifest;
`,
);

console.log('build-manifest: bundled dist/manifest.js + dist/manifest.d.ts');
