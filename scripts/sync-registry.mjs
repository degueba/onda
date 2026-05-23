#!/usr/bin/env node
// Regenerate registry/registry.json from each component's meta.json.
//
// The per-component <slug>.meta.json files are the source of truth for
// title / description / category / dependencies — that's what the docs site
// reads and what authors edit. registry.json is the public shadcn-cli
// manifest; this script keeps it in lockstep so the two cannot drift.
//
// Run via `pnpm sync-registry` (or `node scripts/sync-registry.mjs`).
//
// Behavior:
//   - Authoritative set of components = directories under registry/components
//     that have BOTH <slug>.meta.json and README.md. WIP dirs missing either
//     are skipped (same rule the docs site uses to surface a component).
//   - Existing item order in registry.json is preserved. New components are
//     appended at the end so the file can be hand-reordered by category.
//   - Items in registry.json whose slug no longer matches a published
//     component are dropped.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const REGISTRY_PATH = resolve(ROOT, 'registry/registry.json');
const COMPONENTS_DIR = resolve(ROOT, 'registry/components');

/**
 * Load every published component's meta.json. "Published" = the dir has
 * both <slug>.meta.json and README.md; WIP dirs are skipped.
 */
function loadMetas() {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const compDir = resolve(COMPONENTS_DIR, d.name);
      const metaPath = resolve(compDir, `${d.name}.meta.json`);
      const readmePath = resolve(compDir, 'README.md');
      if (!existsSync(metaPath) || !existsSync(readmePath)) return null;
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      return { slug: d.name, meta };
    })
    .filter(Boolean);
}

/**
 * Build a registry item from a meta entry. meta.json uses `category`
 * (singular string); shadcn's registry schema uses `categories` (array),
 * so we wrap on the way out.
 */
function buildItem({ slug, meta }) {
  return {
    name: slug,
    type: 'registry:component',
    title: meta.title,
    description: meta.description,
    categories: [meta.category],
    dependencies: meta.dependencies ?? [],
  };
}

const metas = loadMetas();
const metaBySlug = new Map(metas.map((m) => [m.slug, m]));

const current = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
const currentItems = Array.isArray(current.items) ? current.items : [];

// Walk current order. Keep items that still have a published meta; refresh
// their fields. Drop everything else. Track what we touched so we can
// append the leftovers (new components) at the end.
const touched = new Set();
const kept = [];
for (const item of currentItems) {
  const m = metaBySlug.get(item.name);
  if (!m) continue; // component no longer published
  kept.push(buildItem(m));
  touched.add(m.slug);
}

// New components — preserved-order append by slug for deterministic output.
const added = metas
  .filter((m) => !touched.has(m.slug))
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map(buildItem);

const next = {
  ...current,
  items: [...kept, ...added],
};

writeFileSync(REGISTRY_PATH, formatRegistry(next) + '\n');

/**
 * Format the registry with one tweak vs `JSON.stringify(_, null, 2)`:
 * arrays of primitives (categories, dependencies, tags) stay on one line.
 * Matches the original hand-written file and keeps each item readable as a
 * single visual block.
 */
function formatRegistry(value) {
  return stringify(value, 0);
}

function stringify(value, depth) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  const pad = '  '.repeat(depth);
  const inner = '  '.repeat(depth + 1);

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      return '[' + value.map((v) => JSON.stringify(v)).join(', ') + ']';
    }
    if (value.length === 0) return '[]';
    return '[\n' + value.map((v) => inner + stringify(v, depth + 1)).join(',\n') + '\n' + pad + ']';
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';
  return (
    '{\n' +
    entries
      .map(([k, v]) => inner + JSON.stringify(k) + ': ' + stringify(v, depth + 1))
      .join(',\n') +
    '\n' +
    pad +
    '}'
  );
}

const changedCount = kept.length;
const addedCount = added.length;
const droppedCount = currentItems.length - kept.length;
console.log(
  `synced ${changedCount} item${changedCount === 1 ? '' : 's'}` +
    `, added ${addedCount}, dropped ${droppedCount}`,
);
