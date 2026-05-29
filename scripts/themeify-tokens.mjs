#!/usr/bin/env node
// One-time, idempotent migration: rewrite hardcoded Onda *token* string literals
// in registry/ into their CSS var() form, so components respond to brand
// overrides (see lib/tokens.ts THEME / lib/theme.tsx). Only exact token values
// are touched — single-quoted hex colors that match a palette token, and the two
// canonical font stacks. Bespoke (non-token) colors and the mono stacks are left
// alone. The var() fallback is the original value, so no-brand renders are byte-
// identical. Re-running is a no-op (the var() form no longer matches the literal).
//
// Usage: node scripts/themeify-tokens.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REGISTRY = join(dirname(fileURLToPath(import.meta.url)), '..', 'registry');

// Palette token hex -> CSS var name (mirrors lib/tokens.ts CSS_VAR).
const COLOR_VAR = {
  '#08080A': '--onda-bg',
  '#0E0E12': '--onda-surface',
  '#121217': '--onda-surface-2',
  '#1C1C22': '--onda-border',
  '#26262E': '--onda-border-lit',
  '#F2F2F4': '--onda-text',
  '#8E8E98': '--onda-dim',
  '#56565F': '--onda-faint',
  '#D96B82': '--onda-accent',
  '#E89AAB': '--onda-accent-soft',
};

// Canonical font stacks -> [var name, fallback]. Mono / variant stacks are
// deliberately excluded — they aren't brand tokens.
const FONT_VAR = {
  '\'"Clash Display", sans-serif\'': ['--onda-font-display', '"Clash Display", sans-serif'],
  '\'"Space Grotesk", sans-serif\'': ['--onda-font-body', '"Space Grotesk", sans-serif'],
};

/** [literal, replacement] pairs — exact, quote-delimited string substitutions. */
const replacements = [
  ...Object.entries(COLOR_VAR).map(([hex, name]) => [`'${hex}'`, `'var(${name}, ${hex})'`]),
  ...Object.entries(FONT_VAR).map(([lit, [name, fb]]) => [lit, `'var(${name}, ${fb})'`]),
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

let filesChanged = 0;
let total = 0;
const perToken = {};
for (const file of walk(REGISTRY)) {
  let src = readFileSync(file, 'utf8');
  let count = 0;
  for (const [find, repl] of replacements) {
    const parts = src.split(find);
    const n = parts.length - 1;
    if (n > 0) {
      src = parts.join(repl);
      count += n;
      perToken[find] = (perToken[find] ?? 0) + n;
    }
  }
  if (count > 0) {
    writeFileSync(file, src);
    filesChanged += 1;
    total += count;
  }
}

console.log(`themeify-tokens: ${filesChanged} files changed, ${total} replacements`);
for (const [k, v] of Object.entries(perToken).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(3)}  ${k}`);
}
