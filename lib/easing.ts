// House easing curves.
//
// For physical motion (translate / scale / rotation) use the springs in
// lib/motion.ts — SPRING_SMOOTH (default, no overshoot) and SPRING_SNAPPY
// (faster but still overdamped). HOUSE_EASE below is the canonical curve
// for opacity / color / non-physical transitions only.

import { Easing } from 'remotion';

/**
 * The house easing curve — a restrained ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
 *
 * Use for opacity / color fades and anything the eye tracks but that doesn't
 * move physically. Never raw linear for tracked motion.
 *
 * For physical motion (translate / scale / rotation), use the springs in
 * `lib/motion.ts` instead — `SPRING_SMOOTH` (default, no overshoot) or
 * `SPRING_SNAPPY` (faster but still overdamped).
 *
 * @example
 * interpolate(frame, [0, 18], [0, 1], {
 *   extrapolateLeft: 'clamp',
 *   extrapolateRight: 'clamp',
 *   easing: HOUSE_EASE,
 * });
 */
export const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);
