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
      // Techspec 027 — optional picking-enrichment fields. Both pass
      // through unchanged from meta.json. Undefined when omitted.
      pickWhen: typeof meta.pickWhen === 'string' ? meta.pickWhen : undefined,
      composes: Array.isArray(meta.composes) ? meta.composes : undefined,
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

// Validate every `composes` slug resolves to a real manifest entry — a
// dangling reference would silently rot the prefer-the-scene-block hint
// downstream. Cheap to enforce here where every slug is in scope.
const knownSlugs = new Set(all.map((e) => e.name));
const composesErrors = [];
for (const e of all) {
  if (!e.composes) continue;
  for (const target of e.composes) {
    if (!knownSlugs.has(target)) {
      composesErrors.push(
        `  - ${e.kind}/${e.slug} composes "${target}" — no such manifest entry`,
      );
    }
  }
}
if (composesErrors.length > 0) {
  console.error(
    'sync-manifest-module: invalid `composes` references:\n' +
      composesErrors.join('\n'),
  );
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
  .map((e) => {
    const lines = [
      '  {',
      `    name: ${JSON.stringify(e.name)},`,
      `    category: ${JSON.stringify(e.category)},`,
      `    title: ${JSON.stringify(e.title)},`,
      `    description: ${JSON.stringify(e.description)},`,
    ];
    if (e.pickWhen !== undefined) {
      lines.push(`    pickWhen: ${JSON.stringify(e.pickWhen)},`);
    }
    if (e.composes !== undefined) {
      lines.push(`    composes: ${JSON.stringify(e.composes)},`);
    }
    lines.push(`    schema: ${e.identifier},`, '  },');
    return lines.join('\n');
  })
  .join('\n');

// The typed schemas map — same data as the array's `schema` field, but
// keyed by slug with `as const` so each value's specific Zod type is
// preserved through `typeof`. Issue #52: lets consumers build typed
// `z.discriminatedUnion` variants without losing prop inference.
const schemasMapLines = all
  .map((e) => `  ${JSON.stringify(e.name)}: ${e.identifier},`)
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
  /** One sentence — when to pick this over its near-neighbors. Written
   *  for an LLM choosing between siblings in the same category. Authored
   *  alongside \`description\` in <slug>.meta.json; kept under ~140 chars
   *  by convention so it survives prompt truncation. Optional —
   *  undefined when not yet backfilled (techspec 027). */
  pickWhen?: string;
  /** Component slugs this entry delegates motion to. Populated only for
   *  scene blocks and other composing entries; \`undefined\` for
   *  primitives. Build-time validated to resolve against real manifest
   *  entries (techspec 027). */
  composes?: ReadonlyArray<string>;
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

/**
 * Slug → schema map, keyed by the same slugs as the manifest array.
 * Unlike \`manifest[i].schema\` (typed as \`z.ZodTypeAny\` because the
 * array is homogeneously typed), each value here keeps its specific
 * Zod type — so \`schemas['quote-card']\` resolves to
 * \`typeof quoteCardSchema\`, not \`ZodTypeAny\`, and
 * \`z.infer<typeof schemas['quote-card']>\` produces the real props
 * shape. Use this when you need per-entry type inference
 * (e.g. building a typed \`z.discriminatedUnion\` over onda entries);
 * use the array \`manifest\` when you need to iterate, filter by
 * category, or render to docs / prompts. Issue #52.
 */
export const schemas = {
${schemasMapLines}
} as const;

/** Type of the {@link schemas} map. Use \`OndaSchemas[K]\` to recover
 *  the specific Zod schema type for a given slug. */
export type OndaSchemas = typeof schemas;

/** Union of every onda entry slug — every component and transition
 *  name in the catalog. Use as the discriminator literal when
 *  building \`z.discriminatedUnion\` variants over onda entries. */
export type OndaComponentName = keyof OndaSchemas;

export default manifest;
`;

writeFileSync(OUT_PATH, fileBody);
console.log(
  `sync-manifest-module: wrote ${all.length} entries (${components.length} components + ${transitions.length} transitions) to ${OUT_PATH.replace(ROOT + '/', '')}`,
);
