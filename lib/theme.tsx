// Brand theming — the seam that lets any consumer skin Onda components with
// their own palette and fonts. Components default their color/font props to the
// `THEME` var() tokens (see `./tokens`); this module turns a `Brand` into the
// CSS custom properties those vars read, applied at a root element.
//
// Brand drives the *surface* (color + type) at runtime via CSS variables.
// Motion (springs, easing, timing, stagger) is Onda's signature default, not a
// lock — there are no runtime motion slots here yet, but components ship as
// copied source, so consumers own and can tune motion directly (see
// `lib/motion.ts`).

import React from 'react';
import { z } from 'zod';
import { CSS_VAR } from './tokens';

/**
 * A consumer's brand — optional overrides for the surface-level token slots.
 * Apply it via {@link brandToCssVars} (spread onto a root element) or wrap with
 * {@link ThemeProvider}; every Onda component beneath re-skins. Omitted slots
 * fall back to the canonical Onda token.
 */
export const brandSchema = z
  .object({
    /** Page / canvas background. */
    bg: z.string(),
    /** Raised surface (cards, panels). */
    surface: z.string(),
    /** Secondary surface. */
    surface2: z.string(),
    /** Default 1px border. */
    border: z.string(),
    /** Hover / focus border. */
    borderLit: z.string(),
    /** Primary text. */
    text: z.string(),
    /** Secondary text. */
    dim: z.string(),
    /** Labels, captions, faint text. */
    faint: z.string(),
    /** The earned accent — one CTA / headline word / underline. */
    accent: z.string(),
    /** Lighter accent step for subtle depth. */
    accentSoft: z.string(),
    /** Display / heading font stack, e.g. `'"Inter", sans-serif'`. */
    fontDisplay: z.string(),
    /** Body / UI font stack. */
    fontBody: z.string(),
  })
  .partial();

export type Brand = z.infer<typeof brandSchema>;

const SLOT_TO_VAR: Record<keyof Brand, string> = {
  bg: CSS_VAR.bg,
  surface: CSS_VAR.surface,
  surface2: CSS_VAR.surface2,
  border: CSS_VAR.border,
  borderLit: CSS_VAR.borderLit,
  text: CSS_VAR.text,
  dim: CSS_VAR.dim,
  faint: CSS_VAR.faint,
  accent: CSS_VAR.accent,
  accentSoft: CSS_VAR.accentSoft,
  fontDisplay: CSS_VAR.fontDisplay,
  fontBody: CSS_VAR.fontBody,
};

/**
 * Turn a {@link Brand} into a style object of CSS custom properties. Spread it
 * onto a root element; every Onda component beneath inherits the overrides, and
 * unset slots fall back to the canonical Onda token. Returns `{}` for no brand,
 * so the default Onda look renders unchanged.
 */
export function brandToCssVars(brand?: Brand | null): React.CSSProperties {
  const vars: Record<string, string> = {};
  if (brand) {
    for (const slot of Object.keys(SLOT_TO_VAR) as (keyof Brand)[]) {
      const value = brand[slot];
      if (value) vars[SLOT_TO_VAR[slot]] = value;
    }
  }
  return vars as React.CSSProperties;
}

export type ThemeProviderProps = {
  /** Brand overrides to apply. Omit for the default Onda look. */
  brand?: Brand | null;
  children?: React.ReactNode;
  /** Extra styles merged after the brand vars. */
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Convenience wrapper that injects a {@link Brand} as CSS variables onto a
 * container, re-skinning every Onda component within. Renders a
 * `display: contents` div by default (no layout box) — pass `style` /
 * `className` to make it a real container. For compositions, the renderer
 * applies the brand at its root automatically (see `CompositionRenderer`'s
 * `brand` prop), so this is for DOM contexts and standalone component use.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  brand,
  children,
  style,
  className,
}) => (
  <div
    className={className}
    style={{ display: 'contents', ...brandToCssVars(brand), ...style }}
  >
    {children}
  </div>
);
