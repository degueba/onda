import React from 'react';
import { CameraMotionBlur, Trail } from '@remotion/motion-blur';
import { SHUTTER } from '../motion';

/**
 * True sample-accumulation motion blur — the "looks shot, not strobed" pass for
 * fast moves (whip pans, quick transforms, camera fly-overs). Wraps Remotion's
 * maintained `@remotion/motion-blur` `<CameraMotionBlur>`: it re-renders the
 * children at sub-frame samples and accumulates them, so anything inside that
 * moves picks up directional blur. House defaults come from the `SHUTTER` token
 * (180° shutter, 10 samples). Deterministic (CLAUDE.md §1) — children are pure
 * functions of the frame, so the samples are too. Opt-in; never wrap a whole
 * calm scene (it taxes the render and mushes still content).
 */
export type MotionBlurProps = {
  children?: React.ReactNode;
  /** Sub-frame samples accumulated per frame. More = smoother, costlier. */
  samples?: number;
  /** Shutter angle in degrees. 180 = cinematic default; higher = more blur. */
  shutterAngle?: number;
};

export const MotionBlur: React.FC<MotionBlurProps> = ({
  children,
  samples = SHUTTER.samples,
  shutterAngle = SHUTTER.angle,
}) => (
  <CameraMotionBlur samples={samples} shutterAngle={shutterAngle}>
    {children}
  </CameraMotionBlur>
);

/**
 * A cheaper echo / onion-skin trail — decaying copies of a moving layer lagging
 * behind it. Reads as a stylized speed trail (logo stings, fast UI, sport/gaming
 * energy) rather than physically-accurate blur. Wraps `@remotion/motion-blur`'s
 * `<Trail>`. Deterministic — the lagged copies render the same pure children at
 * earlier frames.
 */
export type MotionTrailProps = {
  children?: React.ReactNode;
  /** Number of trailing echo copies. */
  layers?: number;
  /** Frames of lag between successive echoes. */
  lagInFrames?: number;
  /** Opacity of the trailing echoes (the live layer stays at 1). */
  trailOpacity?: number;
};

export const MotionTrail: React.FC<MotionTrailProps> = ({
  children,
  layers = 5,
  lagInFrames = 1,
  trailOpacity = 0.5,
}) => (
  <Trail layers={layers} lagInFrames={lagInFrames} trailOpacity={trailOpacity}>
    {children}
  </Trail>
);
