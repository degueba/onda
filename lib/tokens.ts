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

/**
 * CSS custom-property names for each brand-overridable token slot. A consumer
 * (or Onda Studio's brand kit) sets these on a root element to re-skin every
 * component; unset, components fall back to the canonical Onda value above.
 *
 * Only **surface** slots are themeable — color and type. Motion tokens
 * (springs, easing, timing, stagger) are intentionally absent: motion is
 * Onda's signature and stays locked. Brand owns the surface; Onda owns motion.
 */
export const CSS_VAR = {
  bg: '--onda-bg',
  surface: '--onda-surface',
  surface2: '--onda-surface-2',
  border: '--onda-border',
  borderLit: '--onda-border-lit',
  text: '--onda-text',
  dim: '--onda-dim',
  faint: '--onda-faint',
  accent: '--onda-accent',
  accentSoft: '--onda-accent-soft',
  fontDisplay: '--onda-font-display',
  fontBody: '--onda-font-body',
} as const;

/**
 * Themed token strings — a CSS `var()` that reads the brand override with the
 * canonical Onda token as the fallback. Components default their color / font
 * props to *these* (not the raw hex), so an unset brand renders identically to
 * {@link COLOR} / {@link FONT}, while setting the matching {@link CSS_VAR}
 * re-skins them with zero per-component work.
 *
 * e.g. `THEME.accent === 'var(--onda-accent, #D96B82)'`.
 */
export const THEME = {
  bg: `var(${CSS_VAR.bg}, ${COLOR.bg})`,
  surface: `var(${CSS_VAR.surface}, ${COLOR.surface})`,
  surface2: `var(${CSS_VAR.surface2}, ${COLOR.surface2})`,
  border: `var(${CSS_VAR.border}, ${COLOR.border})`,
  borderLit: `var(${CSS_VAR.borderLit}, ${COLOR.borderLit})`,
  text: `var(${CSS_VAR.text}, ${COLOR.text})`,
  dim: `var(${CSS_VAR.dim}, ${COLOR.dim})`,
  faint: `var(${CSS_VAR.faint}, ${COLOR.faint})`,
  accent: `var(${CSS_VAR.accent}, ${COLOR.accent})`,
  accentSoft: `var(${CSS_VAR.accentSoft}, ${COLOR.accentSoft})`,
  fontDisplay: `var(${CSS_VAR.fontDisplay}, ${FONT.display})`,
  fontBody: `var(${CSS_VAR.fontBody}, ${FONT.body})`,
} as const;

/** Keys of {@link THEME} / {@link CSS_VAR} — the brand-overridable slots. */
export type ThemeSlot = keyof typeof THEME;
