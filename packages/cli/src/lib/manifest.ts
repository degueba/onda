import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The slim shape of a registry-item manifest the CLI needs to operate on.
// Mirrors the shadcn registry-item schema but only the fields we actually
// read. Anything else in the JSON is preserved-but-ignored.
//
// Why hand-rolled validation instead of Zod (which the design.md hinted
// at): pulling Zod as a runtime dep adds ~70 kB to the published bundle
// for a known, simple, evolves-slowly shape. The TS types here are the
// contract; the asserts below catch the cases that actually go wrong in
// practice (missing required field, wrong type). If the shape ever grows
// to ten+ fields we can revisit.

export type ManifestFileKind = 'registry:component' | 'registry:lib' | 'registry:file';

export type ManifestFile = {
  path: string;
  type: ManifestFileKind;
  target: string;
  content: string;
};

export type Manifest = {
  $schema?: string;
  name: string;
  type: 'registry:component' | 'registry:lib';
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: ManifestFile[];
};

/**
 * Fetch a manifest from either an HTTP(S) URL or a file:// URL.
 *
 * The CLI defaults `--registry` to `https://remotion.onda.video/r`, but it accepts a
 * `file://` URL too — both for local development against `registry/r/`
 * fixtures and for offline-air-gapped installs in the future. We pass the
 * full per-slug URL here (e.g. `https://remotion.onda.video/r/blur-reveal.json`)
 * rather than the registry root + slug, so the caller controls naming.
 */
export async function fetchManifest(url: string): Promise<Manifest> {
  let raw: string;

  if (url.startsWith('file://')) {
    const path = fileURLToPath(url);
    if (!existsSync(path)) {
      throw new Error(`manifest not found at ${path}`);
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
    throw new Error(`manifest at ${url} is not valid JSON: ${message}`);
  }

  return validateManifest(parsed, url);
}

/**
 * Validate the unknown JSON payload against the {@link Manifest} contract.
 * Throws with a one-line error citing the offending field for any failure
 * the CLI can't recover from. Doesn't try to be a general JSON validator —
 * just enforces the slice of the shape `add` actually reads.
 */
function validateManifest(parsed: unknown, source: string): Manifest {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`manifest at ${source} is not an object`);
  }

  const p = parsed as Record<string, unknown>;

  if (typeof p.name !== 'string' || p.name.length === 0) {
    throw new Error(`manifest at ${source} is missing required "name" string`);
  }
  if (p.type !== 'registry:component' && p.type !== 'registry:lib') {
    throw new Error(
      `manifest at ${source} has unsupported type "${String(p.type)}" — expected "registry:component" or "registry:lib"`,
    );
  }
  if (!Array.isArray(p.files) || p.files.length === 0) {
    throw new Error(
      `manifest at ${source} has no files[] entries (or it's not an array)`,
    );
  }

  const files: ManifestFile[] = p.files.map((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`manifest at ${source} files[${i}] is not an object`);
    }
    const f = entry as Record<string, unknown>;
    if (typeof f.path !== 'string')
      throw new Error(`manifest at ${source} files[${i}].path is not a string`);
    if (typeof f.target !== 'string')
      throw new Error(
        `manifest at ${source} files[${i}].target is not a string`,
      );
    if (typeof f.content !== 'string')
      throw new Error(
        `manifest at ${source} files[${i}].content is not a string`,
      );
    if (
      f.type !== 'registry:component' &&
      f.type !== 'registry:lib' &&
      f.type !== 'registry:file'
    ) {
      throw new Error(
        `manifest at ${source} files[${i}].type "${String(f.type)}" is unsupported`,
      );
    }
    return {
      path: f.path,
      type: f.type,
      target: f.target,
      content: f.content,
    };
  });

  const dependencies = Array.isArray(p.dependencies)
    ? p.dependencies.filter((d): d is string => typeof d === 'string')
    : undefined;
  const registryDependencies = Array.isArray(p.registryDependencies)
    ? p.registryDependencies.filter((d): d is string => typeof d === 'string')
    : undefined;

  return {
    $schema: typeof p.$schema === 'string' ? p.$schema : undefined,
    name: p.name,
    type: p.type,
    title: typeof p.title === 'string' ? p.title : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    dependencies,
    registryDependencies,
    files,
  };
}
