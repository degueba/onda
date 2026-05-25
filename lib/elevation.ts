// Surface-polish tokens — radius, shadow, sheen, glow, blur, grain.
//
// CLAUDE.md §2 "Surface polish" describes these in prose; this file is the
// in-code source of truth. Reach for these before hardcoding a shadow string
// or radius — surfaces across the catalog must feel like one material.

/** Corner radius scale (px). Cards default to `lg` (~20px) per §2. */
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 9999,
} as const;

/**
 * Deep, soft shadows. The Onda card shadow (`card`) is the §2 canonical
 * `0 30px 60px -34px rgba(0,0,0,0.9)` — a long, low-spread drop that reads as
 * depth on the near-black canvas without a hard edge.
 */
export const SHADOW = {
  soft: '0 10px 30px -12px rgba(0,0,0,0.6)',
  card: '0 30px 60px -34px rgba(0,0,0,0.9)',
  lifted: '0 50px 90px -40px rgba(0,0,0,0.95)',
} as const;

/**
 * The 1px top sheen — a barely-there white-alpha gradient that gives a raised
 * surface its lit upper edge. Apply as the `backgroundImage` of an overlay
 * layer (see {@link "./primitives".Surface}); never as the surface's own fill.
 */
export const SHEEN =
  'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%)';

/**
 * Restrained accent glows — **one per major section, max** (§2). These are
 * `box-shadow` strings; layer them on a positioned element, not the content.
 */
export const GLOW = {
  accent: '0 0 80px -20px rgba(217,107,130,0.45)',
  accentSoft: '0 0 120px -30px rgba(232,154,171,0.35)',
  neutral: '0 0 60px -20px rgba(255,255,255,0.10)',
} as const;

/** Backdrop-blur radii (px) for glass surfaces. */
export const BLUR = {
  veil: 6,
  glass: 14,
  frost: 22,
} as const;

/** Grain overlay opacity — ~2% texture, never busy (§2). */
export const GRAIN_OPACITY = 0.02;

export type RadiusToken = keyof typeof RADIUS;
export type ShadowToken = keyof typeof SHADOW;
export type GlowToken = keyof typeof GLOW;
export type BlurToken = keyof typeof BLUR;
