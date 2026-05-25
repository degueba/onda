#!/usr/bin/env node
// Companion codemod to add-kind-discriminator.mjs.
//
// After every component schema gets a `kind` literal, JSX call sites
// that don't pass `kind` break the TypeScript build. This script walks
// composer components + the Remotion Root + showcases, finds every
// JSX call to an Onda component (PascalCase name), and prepends a
// `kind="<slug>"` attribute when one isn't already present.
//
// Derives the slug from the PascalCase component name via
// kebab-case conversion. Robust to nested JSX, props on multiple
// lines, self-closing or block elements.

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = '/Users/rodrigosilva/dev/onda';

// Build the set of known Onda component names + slug map by scanning
// the registry. PascalCase derived from the title (which is the
// canonical PascalCase per meta.json).
const componentNameToSlug = new Map();
for (const slug of readdirSync(resolve(ROOT, 'registry/components'))) {
  const metaPath = resolve(
    ROOT,
    'registry/components',
    slug,
    `${slug}.meta.json`,
  );
  if (!existsSync(metaPath)) continue;
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  componentNameToSlug.set(meta.title, slug);
}

function parseTSX(path, text) {
  return ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function* findJsxOpenings(node) {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
    yield node;
  }
  ts.forEachChild(node, function* (child) {
    yield* findJsxOpenings(child);
  });
}

// Recursive yield* in nested function — alternative is iterative.
function collectJsxOpenings(node, out) {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
    out.push(node);
  }
  ts.forEachChild(node, (child) => collectJsxOpenings(child, out));
}

function refactorFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const sourceFile = parseTSX(filePath, text);

  const openings = [];
  collectJsxOpenings(sourceFile, openings);

  // Filter: only JSX whose tag is an Onda component name we have a slug for.
  // Collect insertion-point + insertion-string pairs.
  const edits = [];
  for (const opening of openings) {
    const tagNode = opening.tagName;
    if (!ts.isIdentifier(tagNode)) continue;
    const slug = componentNameToSlug.get(tagNode.text);
    if (!slug) continue;
    // Skip if `kind` attribute already present.
    const attrs = opening.attributes?.properties ?? [];
    const hasKind = attrs.some(
      (a) =>
        ts.isJsxAttribute(a) &&
        ts.isIdentifier(a.name) &&
        a.name.text === 'kind',
    );
    if (hasKind) continue;

    // Insertion point: immediately after the tag name (and any type args).
    // tagNode.getEnd() is the end of the tag's identifier. Insert one
    // space + the kind attribute.
    const insertAt = tagNode.getEnd();
    edits.push({ pos: insertAt, text: ` kind="${slug}"` });
  }

  if (edits.length === 0) return { touched: false, edits: 0 };

  // Apply edits right-to-left so earlier offsets stay valid.
  edits.sort((a, b) => b.pos - a.pos);
  let updated = text;
  for (const e of edits) {
    updated = updated.slice(0, e.pos) + e.text + updated.slice(e.pos);
  }
  writeFileSync(filePath, updated);
  return { touched: true, edits: edits.length };
}

// Files to process: every composer component impl + Remotion Root + any
// other file the typechecker flagged. We just walk a known set.
const targets = [
  // Composer components
  'registry/components/title-card/TitleCard.tsx',
  'registry/components/chapter-card/ChapterCard.tsx',
  'registry/components/end-card/EndCard.tsx',
  'registry/components/logo-sting/LogoSting.tsx',
  'registry/components/lower-third/LowerThird.tsx',
  'registry/components/quote-card/QuoteCard.tsx',
  'registry/components/stat-card/StatCard.tsx',
  // Remotion Root + showcases that might JSX-call onda components
  'src/Root.tsx',
];

let totalFiles = 0;
let totalEdits = 0;
for (const rel of targets) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) {
    console.log(`  skip (not found): ${rel}`);
    continue;
  }
  try {
    const r = refactorFile(p);
    if (r.touched) {
      console.log(`  ${rel} (+${r.edits} kind attrs)`);
      totalFiles++;
      totalEdits += r.edits;
    }
  } catch (err) {
    console.log(`  ! ${rel}: ${err.message}`);
  }
}

console.log(`\nDone: ${totalFiles} files, ${totalEdits} kind attrs added`);
