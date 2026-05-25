#!/usr/bin/env node
// Generate packages/cli/src/manifest.ts — the runtime manifest module
// that consumers import via `from 'ondajs'`.
//
// What it does:
//   - Walks every meta.json in registry/components/ and registry/transitions/
//   - Derives the schema's export name from the slug (e.g., 'blur-reveal'
//     → 'blurRevealSchema')
//   - Emits one TypeScript file with all imports + a single typed
//     manifest array, alphabetized by slug for stable diffs
//
// Why this and not bundling raw JSON: consumers expect real Zod schema
// objects (the issue's example pipes `entry.schema` into a Zod
// discriminated union — only works with actual Zod instances). The
// generated module imports schemas; esbuild later inlines them into a
// single dist/manifest.js with `zod` left external (consumer brings it).
//
// Run via `pnpm sync-manifest` after adding / removing a component or
// transition. The CLI's prepublish build re-runs this so a stale
// manifest can never reach npm.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const COMPONENTS_DIR = resolve(ROOT, 'registry/components');
const TRANSITIONS_DIR = resolve(ROOT, 'registry/transitions');
const OUT_PATH = resolve(ROOT, 'packages/cli/src/manifest.ts');

// kebab-case → camelCase. Matches the schema-export naming convention
// every component and transition follows (e.g. 'blur-reveal' →
// 'blurReveal', then suffixed with 'Schema').
const toCamel = (kebab) =>
  kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const schemaIdentifierFor = (slug) => `${toCamel(slug)}Schema`;

function scanRegistryDir(dir, kind) {
  if (!existsSync(dir)) return [];
  const entries = [];
  for (const slug of readdirSync(dir).sort()) {
    const metaPath = resolve(dir, slug, `${slug}.meta.json`);
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    entries.push({
      slug,
      kind, // 'components' | 'transitions' — only used to pick the import path
      identifier: schemaIdentifierFor(slug),
      name: meta.name,
      title: meta.title,
      description: meta.description,
      category: meta.category,
    });
  }
  return entries;
}

const components = scanRegistryDir(COMPONENTS_DIR, 'components');
const transitions = scanRegistryDir(TRANSITIONS_DIR, 'transitions');
const all = [...components, ...transitions];

if (all.length === 0) {
  console.error('sync-manifest-module: no entries found — registry empty?');
  process.exit(1);
}

// Build the file content. Imports first, then the typed array. Entries
// are emitted in scan order (components alphabetized, then transitions
// alphabetized) — stable across runs.
const importLines = all
  .map(
    (e) =>
      `import { ${e.identifier} } from '../../../registry/${e.kind}/${e.slug}/schema';`,
  )
  .join('\n');

const arrayLines = all
  .map((e) =>
    [
      '  {',
      `    name: ${JSON.stringify(e.name)},`,
      `    category: ${JSON.stringify(e.category)},`,
      `    title: ${JSON.stringify(e.title)},`,
      `    description: ${JSON.stringify(e.description)},`,
      `    schema: ${e.identifier},`,
      '  },',
    ].join('\n'),
  )
  .join('\n');

const fileBody = `// AUTO-GENERATED — DO NOT EDIT.
// Regenerate via \`pnpm sync-manifest\` (or it runs automatically
// before publish via the CLI package's prepublishOnly hook).
//
// This module is the public runtime manifest exposed via
// \`import { manifest } from 'ondajs'\` — see techspec 018.

import type { z } from 'zod';
${importLines}

/**
 * One entry per onda component or transition. The flat-array shape is
 * deliberate (see techspec 018): consumers building agent layer
 * vocabularies, training-data pipelines, or system-prompt generators
 * iterate the same way regardless of category. Filter by \`category\`
 * when you need only components (\`category !== 'transitions'\`) or only
 * transitions.
 */
export type ComponentManifestEntry = {
  /** Slug — matches the registry folder name. Use as the dispatch key. */
  name: string;
  /** Category from the entry's meta.json — e.g. 'entrances', 'scenes',
   *  'data', 'transitions'. Use to filter components vs transitions. */
  category: string;
  /** PascalCase display name for components, camelCase for transitions. */
  title: string;
  /** One-paragraph description, same string the catalog shows. */
  description: string;
  /** The component's props schema (or the transition's options schema).
   *  A real Zod object — \`.parse()\`, \`.extend()\`, or feed into a
   *  \`z.discriminatedUnion\` directly. */
  schema: z.ZodTypeAny;
  /** Reserved for future. v1 ships without examples — populate in a
   *  later spec when per-component \`examples.ts\` files land. */
  examples?: ReadonlyArray<{
    name: string;
    description?: string;
    props: Record<string, unknown>;
  }>;
};

export const manifest: ReadonlyArray<ComponentManifestEntry> = [
${arrayLines}
];

export default manifest;
`;

writeFileSync(OUT_PATH, fileBody);
console.log(
  `sync-manifest-module: wrote ${all.length} entries (${components.length} components + ${transitions.length} transitions) to ${OUT_PATH.replace(ROOT + '/', '')}`,
);
