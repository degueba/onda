// Generates llms.txt + llms-full.txt from the registry — the canonical,
// machine-readable entry point an AI agent reads to discover what Onda offers
// and how to install it. Deterministic: sorted, derived only from
// registry/registry.json. Run via `node scripts/generate-llms.mjs`.
//
// This publishes the discovery surface; richer per-prop detail is available at
// runtime via lib/registry-summary.ts (summarizeRegistryAsMarkdown) and the
// runtime manifest. This static file is the index agents fetch first.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(join(root, 'registry/registry.json'), 'utf8'));

const CATEGORY_ORDER = [
  'entrances', 'graphics', 'interface', 'data', 'scenes',
  'cinematic', 'media', 'atmosphere', 'transitions',
];
const CATEGORY_BLURB = {
  entrances: 'Reveal a single element — text or graphic — as it enters.',
  graphics: 'Emphasis and treatment effects applied to on-screen content.',
  interface: 'Developer / product UI surfaces: code, terminals, frames, steppers.',
  data: 'Numbers and charts that animate into place.',
  scenes: 'Full scene blocks — titles, stats, quotes, end cards.',
  cinematic: 'Camera-feel moves: pans, parallax, shake.',
  media: 'Audio, video, and caption primitives.',
  atmosphere: 'Full-canvas background and texture layers.',
  transitions: 'Scene-to-scene cuts for <TransitionSeries>.',
};

const byCategory = new Map();
for (const item of registry.items) {
  const cat = (item.categories && item.categories[0]) || 'other';
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat).push(item);
}
const cats = [...byCategory.keys()].sort(
  (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
);

const header = `# Onda

> Onda is a Remotion-based motion-graphics library with a signature motion identity — a consistent, recognizable feel applied across ordinary components. Source is copied into your project via the CLI (\`npx ondajs add <name>\`), never imported as a black-box dependency, so you own and can edit every file.

Every component is deterministic (a pure function of the current frame — no Math.random/Date in render), ships a Zod schema for its props, and looks complete with zero configuration. Compose them inside Remotion's \`<Composition>\` / \`<Sequence>\`; use transitions inside \`<TransitionSeries>\`.

## Install
\`\`\`
npx ondajs add <name>
\`\`\`
`;

function lineFor(item) {
  return `- **${item.title}** (\`${item.name}\`): ${item.description}`;
}

// llms.txt — concise index.
let index = header + `\n## Catalog (${registry.items.length} items)\n`;
for (const cat of cats) {
  index += `\n### ${cat}\n${CATEGORY_BLURB[cat] ? `_${CATEGORY_BLURB[cat]}_\n` : ''}`;
  for (const item of byCategory.get(cat).sort((a, b) => a.name.localeCompare(b.name))) {
    index += lineFor(item) + '\n';
  }
}

// llms-full.txt — same, plus install lines + dependency notes per entry.
let full = header + `\n## Catalog (${registry.items.length} items)\n\nEach entry ships a Zod schema (\`schema.ts\`), a README with a prop table + usage snippet, and registry metadata. Install any entry with the command above.\n`;
for (const cat of cats) {
  full += `\n## ${cat}\n${CATEGORY_BLURB[cat] ? `${CATEGORY_BLURB[cat]}\n` : ''}`;
  for (const item of byCategory.get(cat).sort((a, b) => a.name.localeCompare(b.name))) {
    full += `\n### ${item.title} \`${item.name}\`\n${item.description}\n- install: \`npx ondajs add ${item.name}\`\n- deps: ${(item.dependencies || []).join(', ')}\n`;
  }
}

const outDir = join(root, 'www/public');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'llms.txt'), index);
writeFileSync(join(outDir, 'llms-full.txt'), full);
console.log(`generate-llms: wrote llms.txt + llms-full.txt (${registry.items.length} items, ${cats.length} categories)`);
