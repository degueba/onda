// Named motion patterns — the Onda choreography vocabulary.
//
// Components compose these helpers rather than reimplementing translate-fade
// for the 10th time. Each helper is a pure function of frame/fps and returns
// style props ready to spread onto a div. New patterns require deliberate
// additions to this file — they extend the vocabulary, they don't sidestep
// it.
//
// Atomic entries:
//   entryFade      — opacity 0→1 only, no transform                  (FadeIn)
//   entrySlide     — opacity + direction-parameterized translate     (SlideIn)
//   entryScale     — opacity + scale from N→1                        (ScaleIn)
//
// Named composites (kept for fingerprint familiarity):
//   entryFadeRise  — opacity + translateY up — the most common entrance
//                    (equivalent to entrySlide({direction:'up', distance:12}))
//
// Exits and special patterns:
//   exitFadeFall   — default exit (faster, downward, fade out)
//   heroReveal     — two-phase landing for hero moments (signature pattern)
//   stateSwap      — in-place crossfade for value/text changes
//
// All patterns accept a `delay` parameter so callers can stagger groups via
// staggerFrames(index) from lib/motion.ts.

import { spring, interpolate } from 'remotion';
import {
  DURATION,
  OVERSHOOT,
  SPRING_SMOOTH,
} from './motion';
import { HOUSE_EASE } from './easing';

type MotionStyle = {
  opacity: number;
  transform: string;
};

type PatternInput = {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
  travelPx?: number;
};

// Pure opacity 0→1 driven by SPRING_SMOOTH. No translate, no scale. The
// simplest possible reveal — use for elements where presence alone changes
// (avatars, full-screen overlays) and where direction would feel arbitrary.
export const entryFade = ({
  frame,
  fps,
  delay = 0,
  durationInFrames = DURATION.base,
}: Omit<PatternInput, 'travelPx'>): { opacity: number } => {
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return { opacity };
};

// Direction-parameterized translate + fade on SPRING_SMOOTH. Generalization
// of entryFadeRise to all four cardinal directions. Travel is bounded to the
// 12–24px Onda envelope; default is 12px to match entryFadeRise's intent.
//
// `direction` names the SETTLING direction — 'up' means the element rises
// INTO place (origin is below). 'left' means it slides leftward into place
// (origin is to the right). This matches how a director would say it.
export const entrySlide = ({
  frame,
  fps,
  delay = 0,
  durationInFrames = DURATION.base,
  direction,
  distance = 12,
}: Omit<PatternInput, 'travelPx'> & {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}): MotionStyle => {
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Sign convention: positive offset at progress 0 for 'up' and 'left'
  // (element starts below / right of its resting position and moves to 0).
  const isVertical = direction === 'up' || direction === 'down';
  const startSign = direction === 'up' || direction === 'left' ? 1 : -1;
  const offset = interpolate(progress, [0, 1], [startSign * distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tx = isVertical ? 0 : offset;
  const ty = isVertical ? offset : 0;

  return {
    opacity,
    transform: `translateX(${tx}px) translateY(${ty}px)`,
  };
};

// Opacity + scale from N→1 driven by SPRING_SMOOTH. Restrained on purpose:
// default `from` is 0.9 (visible but calm). Values below ~0.85 cross into
// dramatic-zoom territory and break the motion language; the schema-level
// caller can constrain further if needed.
export const entryScale = ({
  frame,
  fps,
  delay = 0,
  durationInFrames = DURATION.base,
  from = 0.9,
}: Omit<PatternInput, 'travelPx'> & { from?: number }): MotionStyle => {
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(progress, [0, 1], [from, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    opacity,
    transform: `scale(${scale})`,
  };
};

// Default entrance. Translate up + fade in on SPRING_SMOOTH at base duration.
// The workhorse — appropriate for ~80% of entering elements. Equivalent to
// `entrySlide({ direction: 'up', distance: 12 })` but kept under its own
// name as the most common entrance vocabulary item.
export const entryFadeRise = ({
  frame,
  fps,
  delay = 0,
  durationInFrames = DURATION.base,
  travelPx = 12,
}: PatternInput): MotionStyle => {
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames,
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(progress, [0, 1], [travelPx, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return { opacity, transform: `translateY(${ty}px)` };
};

// Default exit. Translate down + fade out at fast duration (exits are ~30%
// faster than entries — get out of the way faster than you came in).
export const exitFadeFall = ({
  frame,
  delay = 0,
  durationInFrames = DURATION.fast,
  travelPx = 8,
}: PatternInput): MotionStyle => {
  const local = frame - delay;
  const progress = interpolate(local, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });
  return {
    opacity: 1 - progress,
    transform: `translateY(${progress * travelPx}px)`,
  };
};

// Hero reveal — the two-phase landing pattern, candidate Onda signature.
// Phase 1: SPRING_SMOOTH translate + fade over the full duration.
// Phase 2: a 3% scale overshoot near the end that settles back to 1.0.
// The two phases are perceived as one continuous landing. Reserve for at
// most one element per scene.
export const heroReveal = ({
  frame,
  fps,
  delay = 0,
  durationInFrames = DURATION.slow,
  travelPx = 16,
}: PatternInput): MotionStyle => {
  const local = frame - delay;

  const rise = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames,
  });
  const opacity = interpolate(rise, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(rise, [0, 1], [travelPx, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Triangle wave 0 → OVERSHOOT → 0 across ~10 frames, kicked off 4 frames
  // before phase 1 nominally completes so the landing reads as one motion.
  const landStart = durationInFrames - 4;
  const scaleBump = interpolate(
    local,
    [landStart, landStart + 5, landStart + 10],
    [0, OVERSHOOT, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return {
    opacity,
    transform: `translateY(${ty}px) scale(${1 + scaleBump})`,
  };
};

// In-place state swap — for a value or label changing while its container
// stays put. Crossfade with HOUSE_EASE; the one place §A.3 of the motion
// language allows ease-in-out-like symmetry, because neither the outgoing
// nor incoming value deserves emphasis.
export const stateSwap = ({
  frame,
  delay = 0,
  durationInFrames = DURATION.fast,
}: Omit<PatternInput, 'travelPx'>): { outOpacity: number; inOpacity: number } => {
  const local = frame - delay;
  const half = durationInFrames / 2;
  const outOpacity = interpolate(local, [0, half], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });
  const inOpacity = interpolate(local, [half, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });
  return { outOpacity, inOpacity };
};
