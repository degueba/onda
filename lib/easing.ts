// House easing curves.
//
// For physical motion (translate / scale / rotation) use the springs in
// lib/motion.ts — SPRING_SMOOTH (default, no overshoot) and SPRING_SNAPPY
// (faster but still overdamped). HOUSE_EASE below is the canonical curve
// for opacity / color / non-physical transitions only.

import { Easing } from 'remotion';

// House easing curve — a restrained ease-out. Use for opacity / color fades
// and anything the eye tracks but that doesn't move physically. Never raw
// linear for tracked motion.
export const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);
