// Single source of truth for the wave geometry shared by all premium
// LogoWave variants. Defining the path + viewBox here means every variant
// lines up visually and animates against the same metrics — no per-variant
// drift if we tune the curve.
//
// The curve is a 1.5-cycle wave across a 48×12 viewBox, drawn entirely
// with cubic beziers so peaks and troughs stay smooth across continuations
// (no T-discontinuity artifacts) and every control point sits comfortably
// inside the viewBox (no peaks clipped above y=0). Stroke widths up to ~3px
// fit cleanly within the resulting silhouette.

export const WAVE_VIEWBOX = '0 0 48 12';
export const WAVE_VIEWBOX_W = 48;
export const WAVE_VIEWBOX_H = 12;
export const WAVE_ASPECT = WAVE_VIEWBOX_W / WAVE_VIEWBOX_H; // 4:1

/**
 * SVG `d` for the wave — same path used by every variant.
 *
 * Three contiguous cubic Beziers form a peak → trough → peak silhouette:
 *   1. start → first peak (controls at y=1 keep the apex near y≈3)
 *   2. peak → trough (controls at y=11 keep the dip near y≈9)
 *   3. trough → second peak → end (mirror of #1)
 */
export const WAVE_PATH =
  'M 2 6 C 7 1, 13 1, 17 6 C 21 11, 27 11, 31 6 C 35 1, 41 1, 46 6';
