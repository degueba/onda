#!/usr/bin/env node
// Regenerate `content` (and refresh meta-derived fields) on every per-slug
// CLI manifest in `registry/r/*.json` from the current component source.
//
// Why this exists:
//   Each manifest carries the full source of every file it ships as an
//   escaped-string `content` field. Whenever a component's .tsx, README,
//   schema.ts, or meta.json changes, its manifest MUST be regenerated or
//   the CLI distributes stale source. With ~22 components touched in 015
//   alone, hand-maintaining 22 manifests doesn't scale.
//
// What this preserves:
//   - The manifest's existing `registryDependencies` (the dep graph is
//     hand-maintained per component — auto-detecting via import parsing is
//     fragile and over-eager).
//   - The manifest's existing `files[]` order and `target` paths.
//   - The manifest's existing `type`.
//
// What this refreshes from disk:
//   - Every file's `content` (verbatim from the source file).
//   - `title`, `description`, `dependencies` (from meta.json — the authoring
//     source of truth, same as the top-level registry.json sync).
//
// New components still need a one-time hand-bootstrap (see the audio
// primitives PR for the pattern). Once bootstrapped, this script keeps
// them in sync for the rest of their life.
//
// Run via `pnpm sync-manifests` (or `node scripts/sync-manifests.mjs`).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const MANIFEST_DIR = resolve(ROOT, 'registry/r');
const COMPONENTS_DIR = resolve(ROOT, 'registry/components');
const TRANSITIONS_DIR = resolve(ROOT, 'registry/transitions');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function readMaybe(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

const manifestFiles = readdirSync(MANIFEST_DIR).filter((f) => f.endsWith('.json'));

let touched = 0;
let skipped = 0;
const errors = [];

for (const mf of manifestFiles) {
  const slug = mf.replace(/\.json$/, '');
  const manifestPath = resolve(MANIFEST_DIR, mf);
  const manifest = readJson(manifestPath);

  // Lib manifests (lib-canvas, lib-motion, etc.) ship from lib/ not
  // registry/components/. They have a meta-less layout; refresh their
  // file content but skip the meta-derived fields.
  const isLibManifest = slug.startsWith('lib-');

  let metaPath = null;
  let meta = null;
  if (!isLibManifest) {
    // Catalog entries live under either registry/components/ (default)
    // or registry/transitions/ (per techspec 017). Check both — the
    // first match wins.
    const componentMetaPath = resolve(COMPONENTS_DIR, slug, `${slug}.meta.json`);
    const transitionMetaPath = resolve(TRANSITIONS_DIR, slug, `${slug}.meta.json`);
    if (existsSync(componentMetaPath)) {
      metaPath = componentMetaPath;
    } else if (existsSync(transitionMetaPath)) {
      metaPath = transitionMetaPath;
    } else {
      errors.push(`${slug}: missing meta.json (looked in components/ and transitions/)`);
      continue;
    }
    meta = readJson(metaPath);
  }

  let changed = false;

  // Refresh meta-derived fields for component manifests only.
  if (meta) {
    if (manifest.title !== meta.title) {
      manifest.title = meta.title;
      changed = true;
    }
    if (manifest.description !== meta.description) {
      manifest.description = meta.description;
      changed = true;
    }
    const metaDeps = meta.dependencies ?? [];
    if (JSON.stringify(manifest.dependencies ?? []) !== JSON.stringify(metaDeps)) {
      manifest.dependencies = metaDeps;
      changed = true;
    }
  }

  // Refresh every file's content from disk.
  for (const file of manifest.files) {
    const onDisk = resolve(ROOT, file.path);
    const content = readMaybe(onDisk);
    if (content === null) {
      errors.push(`${slug}: file ${file.path} listed in manifest but missing on disk`);
      continue;
    }
    if (file.content !== content) {
      file.content = content;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    touched++;
  } else {
    skipped++;
  }
}

console.log(`synced ${touched} manifest${touched === 1 ? '' : 's'} (${skipped} unchanged)`);

if (errors.length) {
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
