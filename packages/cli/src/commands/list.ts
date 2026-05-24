import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs, stringFlag, boolFlag } from '../lib/argv.js';

// `ondajs list` — print the catalog grouped by category.
//
// Fetches `<registry>/index.json` (which the docs site serves as a static
// copy of `registry/registry.json`). The shadcn-format registry-item
// payload is what we use everywhere else, so reusing the same shape for
// the catalog keeps the on-the-wire surface uniform.

const DEFAULT_REGISTRY = 'https://onda.video/r';

// Category display order. Mirrors the site's `CATEGORY_ORDER` so a user
// switching between the docs and the CLI sees the same shape.
const CATEGORY_ORDER = [
  'entrances',
  'data',
  'graphics',
  'atmosphere',
  'cinematic',
  'scenes',
] as const;

type Registry = {
  name?: string;
  items: Array<{
    name: string;
    title?: string;
    description?: string;
    categories?: string[];
  }>;
};

type ListOptions = {
  registry: string;
  category: string;
  json: boolean;
};

export async function runList(args: string[]): Promise<void> {
  const opts = parseListArgs(args);

  let registry: Registry;
  try {
    registry = await fetchCatalog(opts.registry);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    process.stderr.write(`onda list: ${message}\n`);
    process.exit(1);
  }

  const items = registry.items.filter((item) => {
    // Skip lib helpers — they're install-time implementation detail; the
    // user-facing catalog is components only. Lib slugs follow the
    // `lib-<name>` convention so we can spot them without a separate
    // field.
    if (item.name.startsWith('lib-')) return false;
    if (opts.category) {
      return (item.categories ?? []).includes(opts.category);
    }
    return true;
  });

  if (opts.category && items.length === 0) {
    const known = Array.from(
      new Set(
        registry.items
          .filter((i) => !i.name.startsWith('lib-'))
          .flatMap((i) => i.categories ?? []),
      ),
    ).sort();
    process.stderr.write(
      `onda list: no components in category "${opts.category}".\n` +
        `  known categories: ${known.join(', ')}\n`,
    );
    process.exit(1);
  }

  if (opts.json) {
    process.stdout.write(
      JSON.stringify(
        items.map((i) => ({
          name: i.name,
          title: i.title ?? null,
          description: i.description ?? null,
          category: (i.categories ?? [])[0] ?? null,
        })),
        null,
        2,
      ) + '\n',
    );
    return;
  }

  // Group by category, in CATEGORY_ORDER (then any unknown categories at the
  // end so a future addition doesn't disappear from the output).
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const cat = (item.categories ?? [])[0] ?? 'other';
    const arr = grouped.get(cat) ?? [];
    arr.push(item);
    grouped.set(cat, arr);
  }

  const orderedKeys: string[] = [];
  for (const cat of CATEGORY_ORDER) {
    if (grouped.has(cat)) orderedKeys.push(cat);
  }
  for (const cat of grouped.keys()) {
    if (!orderedKeys.includes(cat)) orderedKeys.push(cat);
  }

  // Compute the column width once so the dashes line up across the whole
  // listing. Cap at 24 so very long slugs don't push descriptions off-screen.
  const nameColWidth = Math.min(
    24,
    Math.max(...items.map((i) => i.name.length)),
  );

  for (let i = 0; i < orderedKeys.length; i++) {
    const cat = orderedKeys[i];
    const entries = grouped.get(cat)!;
    if (i > 0) process.stdout.write('\n');
    process.stdout.write(`${cat.toUpperCase()}  (${entries.length})\n`);
    for (const item of entries) {
      const name = item.name.padEnd(nameColWidth, ' ');
      const desc = item.description ?? '';
      process.stdout.write(`  ${name}  ${desc}\n`);
    }
  }
  process.stdout.write(
    `\n${items.length} component${items.length === 1 ? '' : 's'}. Install with: onda add <name>\n`,
  );
}

async function fetchCatalog(registryBase: string): Promise<Registry> {
  const base = registryBase.replace(/\/$/, '');
  const url = `${base}/index.json`;

  let raw: string;
  if (url.startsWith('file://')) {
    const path = fileURLToPath(url);
    if (!existsSync(path)) {
      throw new Error(`catalog not found at ${path}`);
    }
    raw = readFileSync(path, 'utf8');
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `failed to fetch ${url} — HTTP ${res.status} ${res.statusText}`,
      );
    }
    raw = await res.text();
  } else {
    throw new Error(
      `unsupported registry URL scheme in "${url}" — expected http://, https://, or file://`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid JSON';
    throw new Error(`catalog at ${url} is not valid JSON: ${message}`);
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as Registry).items)
  ) {
    throw new Error(`catalog at ${url} is missing required "items" array`);
  }

  return parsed as Registry;
}

function parseListArgs(args: string[]): ListOptions {
  const parsed = parseArgs(args);
  const cat = parsed.flags['category'];
  return {
    registry: stringFlag(parsed.flags, 'registry', DEFAULT_REGISTRY),
    category: cat === undefined ? '' : cat === true ? '' : String(cat),
    json: boolFlag(parsed.flags, 'json'),
  };
}
