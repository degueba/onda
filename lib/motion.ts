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

// Duration scale in frames at 30fps. At other framerates, scale via
// Math.round(DURATION.x * fps / 30) at the call site.
export const DURATION = {
  instant: 6,   // 0.20s — micro shifts, near-imperceptible feedback
  fast:    10,  // 0.33s — exits, small moves
  base:    18,  // 0.60s — default entrance
  slow:    24,  // 0.80s — large entrances, hero moves
  slower:  30,  // 1.00s — full scene transitions
  hold:    45,  // 1.50s — minimum settled hold (see lib/text-timing.ts)
} as const;
export type DurationToken = keyof typeof DURATION;

// Canonical stagger between sibling elements (lists, words, grouped reveals).
// One value, used everywhere. Never randomized, never per-component.
export const STAGGER = 4; // frames @ 30fps ≈ 0.13s

// Hero-landing overshoot magnitude — a 3% scale bump that settles back to 1.
// Reserved for the two-phase landing pattern (see heroReveal in
// lib/choreography.ts). Per CLAUDE.md §3, any component using overshoot
// outside that pattern must document why.
export const OVERSHOOT = 0.03;

// House spring — smooth, settled, no overshoot. The Onda fingerprint.
// Heavily overdamped: damping/(2*sqrt(stiffness*mass)) = 10. The eye sees a
// confident settle rather than a bounce. Pass directly:
//   spring({ frame, fps, config: SPRING_SMOOTH })
export const SPRING_SMOOTH = {
  damping: 200,
  stiffness: 100,
  mass: 1,
} as const;

// Faster spring for elements that need to feel decisive (counters, value
// swaps, cursor moves). Still heavily overdamped — faster rise, no overshoot.
// Per CLAUDE.md §3, never reduce damping below critical to get a "pop": this
// achieves snappiness via higher stiffness instead.
export const SPRING_SNAPPY = {
  damping: 120,
  stiffness: 180,
  mass: 1,
} as const;

// Stagger offset in frames for the i-th sibling in a grouped reveal. Single
// canonical source so stagger is greppable and consistent.
export const staggerFrames = (index: number, increment: number = STAGGER): number => {
  return Math.max(0, index) * increment;
};
