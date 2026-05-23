// Canonical design tokens for Onda.
//
// CLAUDE.md §2 mirrors these values for agent-context reference. Divergence
// between this file and CLAUDE.md §2 is a bug — the values here are the
// source of truth.

export const COLOR = {
  bg: '#08080A',         // near-black canvas — motion reads best on dark
  surface: '#0E0E12',    // cards, raised surfaces
  surface2: '#121217',   // secondary surface
  border: '#1C1C22',
  borderLit: '#26262E',  // hover / focus borders
  text: '#F2F2F4',       // primary text
  dim: '#8E8E98',        // secondary text
  faint: '#56565F',      // labels, captions, code prompts
  accent: '#D96B82',     // THE accent — muted dusty rose. Used sparingly.
  accentSoft: '#E89AAB', // lighter step, subtle depth only
} as const;

export const FONT = {
  display: '"Clash Display", sans-serif', // headings (weights 500–600)
  body: '"Space Grotesk", sans-serif',    // body / UI / mono (weights 400–600)
} as const;

export const SPACING = [8, 16, 24, 32, 48, 64, 80, 100] as const;

// Scene-block safe margin: ~10% of canvas per edge.
export const SAFE_MARGIN_RATIO = 0.1;

export type ColorToken = keyof typeof COLOR;
export type FontToken = keyof typeof FONT;
