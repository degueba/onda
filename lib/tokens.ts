// Canonical design tokens for Onda.
//
// CLAUDE.md §2 mirrors these values for agent-context reference. Divergence
// between this file and CLAUDE.md §2 is a bug — the values here are the
// source of truth.

/**
 * The Onda color palette. The accent is **earned**, never sprinkled — see
 * `CLAUDE.md §2` for the usage rule.
 *
 * - `bg`         — near-black canvas. Motion reads best on dark.
 * - `surface`    — cards, raised surfaces.
 * - `surface2`   — secondary surface.
 * - `border`     — default 1px border.
 * - `borderLit`  — hover / focus borders.
 * - `text`       — primary text.
 * - `dim`        — secondary text.
 * - `faint`      — labels, captions, code prompts.
 * - `accent`     — THE accent. Muted dusty rose. Used sparingly.
 * - `accentSoft` — lighter step, subtle depth only.
 */
export const COLOR = {
  bg: '#08080A',
  surface: '#0E0E12',
  surface2: '#121217',
  border: '#1C1C22',
  borderLit: '#26262E',
  text: '#F2F2F4',
  dim: '#8E8E98',
  faint: '#56565F',
  accent: '#D96B82',
  accentSoft: '#E89AAB',
} as const;

/**
 * The Onda type stack. Components default to `display` (Clash Display);
 * `body` (Space Grotesk) is reserved for UI / mono contexts.
 *
 * Never default to Inter, Roboto, Arial, or any system font — those read
 * as generic AI defaults and break the brand.
 */
export const FONT = {
  display: '"Clash Display", sans-serif',
  body: '"Space Grotesk", sans-serif',
} as const;

/** The 8px-base spacing scale. Use these values, not arbitrary pixels. */
export const SPACING = [8, 16, 24, 32, 48, 64, 80, 100] as const;

/** Scene-block safe margin: ~10% of canvas per edge. */
export const SAFE_MARGIN_RATIO = 0.1;

/** Keys of {@link COLOR} — for typed color-token props. */
export type ColorToken = keyof typeof COLOR;

/** Keys of {@link FONT} — for typed font-token props. */
export type FontToken = keyof typeof FONT;
