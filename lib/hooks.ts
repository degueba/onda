// Deterministic React hooks for Onda components.
//
// Every hook here reads time via `useCurrentFrame()` and config via
// `useVideoConfig()`, then returns a pure function of the frame. None use
// `useState` / `useEffect` to drive animation (CLAUDE.md §1) — they exist to
// remove the `const frame = useCurrentFrame()` + interpolate boilerplate that
// every component otherwise repeats, not to introduce state.
//
// Pure helpers that don't need the frame (springs, easing math, seeded RNG)
// live in lib/choreography.ts, lib/motion.ts, lib/random.ts. These hooks are
// the thin React-aware layer over them.

import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING_SMOOTH, SPRING_SNAPPY, DURATION, STAGGER, staggerFrames } from './motion';
import { HOUSE_EASE } from './easing';
import {
  entryFade,
  entrySlide,
  entryScale,
  entryFadeRise,
  type MotionStyle,
} from './choreography';
import { seededRandom } from './random';

/** The entrance flavors {@link useEntrance} can produce. */
export type EntranceType = 'fade' | 'rise' | 'scale' | 'slide';

/** Shared entrance options. `type` picks the choreography pattern. */
export type EntranceOptions = {
  type?: EntranceType;
  delay?: number;
  durationInFrames?: number;
  /** For `type: 'slide'` — the settling direction. */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** For `type: 'slide'` — travel distance in px (12–24 envelope). */
  distance?: number;
  /** For `type: 'scale'` — starting scale (default 0.9). */
  from?: number;
};

// Internal: compute an entrance style given an explicit frame/fps. Kept pure
// so {@link useStaggeredEntrance} can call it per-index after reading the
// frame once.
function computeEntrance(
  frame: number,
  fps: number,
  opts: EntranceOptions,
): MotionStyle {
  const {
    type = 'rise',
    delay = 0,
    durationInFrames = DURATION.base,
    direction = 'up',
    distance = 12,
    from = 0.9,
  } = opts;
  switch (type) {
    case 'fade': {
      const { opacity } = entryFade({ frame, fps, delay, durationInFrames });
      return { opacity, transform: 'none' };
    }
    case 'scale':
      return entryScale({ frame, fps, delay, durationInFrames, from });
    case 'slide':
      return entrySlide({ frame, fps, delay, durationInFrames, direction, distance });
    case 'rise':
    default:
      return entryFadeRise({ frame, fps, delay, durationInFrames });
  }
}

/**
 * The workhorse entrance hook — returns `{ opacity, transform }` for the
 * current frame. Dispatches to the {@link "./choreography"} vocabulary so the
 * fingerprint stays consistent.
 *
 * @example
 * const reveal = useEntrance({ type: 'rise', delay: 6 });
 * return <div style={reveal}>{text}</div>;
 */
export function useEntrance(opts: EntranceOptions = {}): MotionStyle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return computeEntrance(frame, fps, opts);
}

/**
 * Call once, get a function that yields the entrance style for sibling `i`,
 * staggered by {@link STAGGER}. The clean way to animate a list/grid without
 * calling a hook in a loop.
 *
 * @example
 * const at = useStaggeredEntrance({ type: 'rise' });
 * return items.map((it, i) => <div key={i} style={at(i)}>{it}</div>);
 */
export function useStaggeredEntrance(
  opts: EntranceOptions & { increment?: number } = {},
): (index: number) => MotionStyle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { increment = STAGGER, delay = 0, ...rest } = opts;
  return (index: number) =>
    computeEntrance(frame, fps, { ...rest, delay: delay + staggerFrames(index, increment) });
}

/**
 * The house spring value (0→1) for the current frame — the one-liner most
 * components reach for to drive a custom interpolation.
 *
 * @example
 * const p = useSpringValue({ delay: 6 });
 * const x = interpolate(p, [0, 1], [40, 0]);
 */
export function useSpringValue(opts: {
  delay?: number;
  durationInFrames?: number;
  snappy?: boolean;
} = {}): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { delay = 0, durationInFrames = DURATION.base, snappy = false } = opts;
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: snappy ? SPRING_SNAPPY : SPRING_SMOOTH,
    durationInFrames,
  });
}

/**
 * Normalized linear progress (0→1) across a window, optionally eased with the
 * {@link HOUSE_EASE}. For opacity/color ramps and anything that isn't physical
 * motion (use {@link useSpringValue} for position/scale).
 */
export function useSceneProgress(opts: {
  delay?: number;
  durationInFrames?: number;
  eased?: boolean;
} = {}): number {
  const frame = useCurrentFrame();
  const { delay = 0, durationInFrames = DURATION.base, eased = true } = opts;
  return interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    ...(eased ? { easing: HOUSE_EASE } : {}),
  });
}

/**
 * A seeded PRNG bound to a `seed`. Returns the next-value function from
 * {@link seededRandom} — identical sequence every render for the same seed, so
 * particles/jitter stay deterministic (CLAUDE.md §1).
 *
 * Not frame-dependent; a hook only so it reads as one alongside the others.
 */
export function useSeededRandom(seed: number): () => number {
  return seededRandom(seed);
}

/**
 * How many units (chars or words) of a reveal are visible at the current
 * frame. Drives typewriter / decode / slot-roll effects. Linear by default —
 * a steady typing cadence reads better than an eased one.
 *
 * @returns An integer count in `[0, length]`.
 *
 * @example
 * const shown = useTextReveal({ length: text.length, durationInFrames: 40 });
 * return <span>{text.slice(0, shown)}</span>;
 */
export function useTextReveal(opts: {
  length: number;
  delay?: number;
  durationInFrames?: number;
  eased?: boolean;
}): number {
  const frame = useCurrentFrame();
  const { length, delay = 0, durationInFrames = DURATION.slower, eased = false } = opts;
  const raw = interpolate(frame - delay, [0, durationInFrames], [0, length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    ...(eased ? { easing: HOUSE_EASE } : {}),
  });
  return Math.floor(raw);
}

/** One stop in a {@link useCameraRig} timeline. */
export type CameraKeyframe = {
  /** Frame at which the camera reaches this stop. Must increase across the list. */
  frame: number;
  /** World x (px) centered in the viewport at this stop. */
  focusX: number;
  /** World y (px) centered in the viewport at this stop. */
  focusY: number;
  /** Zoom about the focus. Default 1. */
  zoom?: number;
  /** Camera roll in degrees. Default 0. */
  rotate?: number;
};

/**
 * Interpolate a `Camera`'s focus / zoom / roll across an ordered list of
 * keyframes, eased with the house curve and clamped at both ends. Frame-pure
 * (CLAUDE.md §1) — spread the result straight into `<Camera {...rig} />`.
 *
 * Keyframe `frame`s must be strictly increasing. Pans hold at the first stop
 * before it and the last stop after it (no extrapolation).
 *
 * @example
 * const rig = useCameraRig([
 *   { frame: 0,  focusX: 400,  focusY: 300,  zoom: 1 },
 *   { frame: 90, focusX: 1600, focusY: 1100, zoom: 1.2 },
 * ]);
 * return <Camera {...rig}>{world}</Camera>;
 */
export function useCameraRig(keyframes: CameraKeyframe[]): {
  focusX: number;
  focusY: number;
  zoom: number;
  rotate: number;
} {
  const frame = useCurrentFrame();
  if (keyframes.length === 0) {
    return { focusX: 0, focusY: 0, zoom: 1, rotate: 0 };
  }
  if (keyframes.length === 1) {
    const k = keyframes[0];
    return { focusX: k.focusX, focusY: k.focusY, zoom: k.zoom ?? 1, rotate: k.rotate ?? 0 };
  }
  const frames = keyframes.map((k) => k.frame);
  const opts = {
    extrapolateLeft: 'clamp' as const,
    extrapolateRight: 'clamp' as const,
    easing: HOUSE_EASE,
  };
  return {
    focusX: interpolate(frame, frames, keyframes.map((k) => k.focusX), opts),
    focusY: interpolate(frame, frames, keyframes.map((k) => k.focusY), opts),
    zoom: interpolate(frame, frames, keyframes.map((k) => k.zoom ?? 1), opts),
    rotate: interpolate(frame, frames, keyframes.map((k) => k.rotate ?? 0), opts),
  };
}
