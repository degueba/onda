import { fetchManifest, type Manifest } from './manifest.js';

// Transitive dependency resolution.
//
// Given a list of input slugs, fetch each manifest, then recursively fetch
// any `registryDependencies` slugs the manifests declare, dedup, and return
// the full set in topological install order (deps first).
//
// Why topo order matters here is *cosmetic* — the file writes themselves
// are independent, but humans read summaries top-down and expect the
// support files (lib helpers, primitives a scene block composes) to show
// up above the thing that depends on them. Topo sort gets that for free.
//
// Cycle detection is included even though our catalog doesn't currently
// have cycles — a future scene-block authoring mistake could introduce
// one, and the failure mode without detection is a stack-overflow recurse
// rather than a clean error message.

export type ResolvedManifest = {
  /** The fetched manifest. */
  manifest: Manifest;
  /** The exact URL the manifest came from (for error messages). */
  url: string;
};

export async function resolveTransitive(
  inputSlugs: string[],
  registryBaseUrl: string,
): Promise<ResolvedManifest[]> {
  const base = registryBaseUrl.replace(/\/$/, '');
  const resolved = new Map<string, ResolvedManifest>();
  // `visiting` tracks slugs whose dep tree we're CURRENTLY walking. If we
  // encounter one we're already visiting, that's a cycle.
  const visiting = new Set<string>();

  async function walk(slug: string, chain: string[]): Promise<void> {
    if (resolved.has(slug)) return;
    if (visiting.has(slug)) {
      const cycle = [...chain, slug].join(' → ');
      throw new Error(`circular registryDependencies: ${cycle}`);
    }

    visiting.add(slug);
    const url = `${base}/${slug}.json`;
    const manifest = await fetchManifest(url);

    // Walk this slug's deps BEFORE recording it in `resolved`, so the order
    // we add to `resolved` is post-order (deps first). That gives us topo
    // order without a second pass.
    for (const depSlug of manifest.registryDependencies ?? []) {
      await walk(depSlug, [...chain, slug]);
    }

    resolved.set(slug, { manifest, url });
    visiting.delete(slug);
  }

  for (const slug of inputSlugs) {
    await walk(slug, []);
  }

  return [...resolved.values()];
}
