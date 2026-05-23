import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const REGISTRY_ROOT = resolve(process.cwd(), '..', 'registry');

export type RegistryItemMeta = {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  dependencies: string[];
};

export type RegistryItem = RegistryItemMeta & {
  readme: string;
};

/**
 * List the slugs of every component currently published to the catalog.
 *
 * A directory is considered published only when **both** its `<slug>.meta.json`
 * and `README.md` exist — in-flight components missing either file are
 * filtered out so the site can build at any point in the queue without
 * crashing on a half-landed primitive. Once an author lands both files,
 * the slug appears here automatically.
 */
export function listComponentSlugs(): string[] {
  const dir = resolve(REGISTRY_ROOT, 'components');
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const compDir = resolve(dir, entry.name);
      return (
        existsSync(resolve(compDir, `${entry.name}.meta.json`)) &&
        existsSync(resolve(compDir, 'README.md'))
      );
    })
    .map((entry) => entry.name)
    .sort();
}

export function listComponents(): RegistryItem[] {
  return listComponentSlugs().map((slug) => getComponent(slug));
}

export function getComponent(slug: string): RegistryItem {
  const compDir = resolve(REGISTRY_ROOT, 'components', slug);
  const metaPath = resolve(compDir, `${slug}.meta.json`);
  const readmePath = resolve(compDir, 'README.md');

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as RegistryItemMeta;
  const readme = readFileSync(readmePath, 'utf-8');

  return { ...meta, readme };
}
