#!/usr/bin/env node
// Copy the in-repo registry into `www/public/r/` so the deployed site serves
// it at `/r/<slug>.json` and `/r/index.json`.
//
// Why static files (vs. an App Router route handler): the files are small,
// many, and change only when components change. Serving them as static
// assets means Vercel's CDN caches them globally for free, and `next build`
// doesn't need to do any per-request work. The trade-off is the public/
// directory carries a generated copy — handled by gitignoring `public/r/`
// so the source-of-truth stays in `registry/r/`.
//
// Runs as a `prebuild` step inside the www package, so a normal
// `pnpm --filter www build` produces a fully self-contained `out` / `.next`
// without any out-of-band coordination.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');

const SRC_DIR = resolve(ROOT, 'registry/r');
const SRC_REGISTRY = resolve(ROOT, 'registry/registry.json');
const OUT_DIR = resolve(__dirname, '..', 'public', 'r');

if (!existsSync(SRC_DIR)) {
  console.error(`sync-registry: source dir ${SRC_DIR} missing`);
  process.exit(1);
}
if (!existsSync(SRC_REGISTRY)) {
  console.error(`sync-registry: ${SRC_REGISTRY} missing`);
  process.exit(1);
}

// Wipe the public/r/ dir each run so deletions in registry/r/ actually
// propagate. The dir is .gitignored so this never affects committed files.
if (existsSync(OUT_DIR)) {
  rmSync(OUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUT_DIR, { recursive: true });

// 1. Copy each per-slug manifest verbatim. We read+write rather than
//    fs.copyFileSync so any future transform (e.g. dropping internal-only
//    fields) has a hook to slot into.
const slugFiles = readdirSync(SRC_DIR).filter((f) => f.endsWith('.json'));
let copied = 0;
for (const file of slugFiles) {
  const src = readFileSync(resolve(SRC_DIR, file), 'utf8');
  writeFileSync(resolve(OUT_DIR, file), src, 'utf8');
  copied++;
}

// 2. Emit /r/index.json — a catalog the `ondajs list` CLI fetches.
//    It's a verbatim copy of registry/registry.json today; if/when we want
//    a slimmer catalog payload, this is where it lives.
const registry = readFileSync(SRC_REGISTRY, 'utf8');
writeFileSync(resolve(OUT_DIR, 'index.json'), registry, 'utf8');

console.error(
  `sync-registry: wrote ${copied} per-slug manifests + index.json to ${OUT_DIR.replace(ROOT + '/', '')}`,
);
