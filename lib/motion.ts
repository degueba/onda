// Canonical motion tokens for Onda — durations, stagger, springs, overshoot.
//
// All Onda components MUST reference these tokens rather than embedding raw
// frame counts or spring configs. The motion signature comes from the closed
// system; raw values fragment it. CLAUDE.md §2 and §3 are the rules; this
// file is the source of truth they refer to.
//
// Values are video-paced for a 30fps house composition. UI animation
// literature (Material, Apple HIG) quotes 200–500ms durations; Onda renders
// to video, where the eye has time to follow and there are no user gestures
// to acknowledge — so durations are deliberately longer than a typical
// product-UI library would use.

/**
 * Duration scale in frames at 30fps. Reach for these tokens before hardcoding
 * a frame count — the motion fingerprint depends on every component sharing
 * the same timing vocabulary.
 *
 * At other framerates, scale via `Math.round(DURATION.x * fps / 30)` at the
 * call site.
 *
 * - `instant` (6f / 0.20s) — micro shifts, near-imperceptible feedback
 * - `fast`    (10f / 0.33s) — exits, small moves
 * - `base`    (18f / 0.60s) — default entrance
 * - `slow`    (24f / 0.80s) — large entrances, hero moves
 * - `slower`  (30f / 1.00s) — full scene transitions
 * - `hold`    (45f / 1.50s) — minimum settled hold (see `lib/text-timing.ts`)
 */
export const DURATION = {
  instant: 6,
  fast:    10,
  base:    18,
  slow:    24,
  slower:  30,
  hold:    45,
} as const;

/** Keys of {@link DURATION} — useful for typed props that pick a duration. */
export type DurationToken = keyof typeof DURATION;

/**
 * Canonical stagger between sibling elements (lists, words, grouped reveals).
 * One value, used everywhere — never randomized, never per-component.
 *
 * `4` frames @ 30fps ≈ 0.13s.
 */
export const STAGGER = 4;

/**
 * Hero-landing overshoot magnitude — a 3% scale bump that settles back to 1.
 *
 * Reserved for the two-phase landing pattern (see {@link "./choreography".heroReveal}).
 * Per `CLAUDE.md §3`, any component using overshoot outside that pattern must
 * document why.
 */
export const OVERSHOOT = 0.03;

/**
 * The house spring — smooth, settled, no overshoot. The Onda fingerprint.
 *
 * Heavily overdamped (damping ratio ≈ 10): the eye sees a confident settle
 * rather than a bounce. Pass directly to Remotion's `spring`:
 *
 * @example
 * spring({ frame, fps, config: SPRING_SMOOTH });
 */
export const SPRING_SMOOTH = {
  damping: 200,
  stiffness: 100,
  mass: 1,
} as const;

/**
 * Faster spring for elements that need to feel decisive (counters, value
 * swaps, cursor moves). Still heavily overdamped — faster rise, no overshoot.
 *
 * Per `CLAUDE.md §3`, never reduce damping below critical to fake a "pop":
 * this config achieves snappiness via higher stiffness instead.
 */
export const SPRING_SNAPPY = {
  damping: 120,
  stiffness: 180,
  mass: 1,
} as const;

/**
 * Stagger offset in frames for the i-th sibling in a grouped reveal. The
 * single canonical helper — every list / word / sibling cascade in the
 * catalog goes through here so stagger stays greppable and consistent.
 *
 * @param index     Zero-based sibling index.
 * @param increment Frames between siblings. Defaults to {@link STAGGER} (4).
 * @returns Frames to delay this sibling's reveal.
 *
 * @example
 * const itemDelay = delay + staggerFrames(i);
 */
export const staggerFrames = (index: number, increment: number = STAGGER): number => {
  return Math.max(0, index) * increment;
};

/**
 * Shutter constants for motion blur — the house default for the `MotionBlur`
 * primitive so blur reads filmic and consistent, never per-call magic numbers.
 *
 * - `angle` (180°) — the cinematic 180° shutter (blur spans half a frame's
 *   travel). The classic "looks shot, not strobed" default.
 * - `samples` (10) — sub-frame samples accumulated per frame. More = smoother
 *   blur at higher render cost; 10 is a good motion-graphics balance.
 */
export const SHUTTER = {
  angle: 180,
  samples: 10,
} as const;
