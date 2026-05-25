import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { spotlightSchema, type SpotlightProps } from './schema';

export { spotlightSchema, type SpotlightProps };

/**
 * Radial light reveal — a soft circle of light grows from 0 to `radius`,
 * centred at (`x`, `y`). Apple-stage aesthetic: one calm, settled motion.
 *
 * Driven by `SPRING_SMOOTH` with no overshoot. The gradient is alpha-aware
 * (transparent outside the lit circle), so anything rendered beneath the
 * spotlight stays visible — this is a reveal, not a fill.
 *
 * @example
 * <Spotlight x={0.5} y={0.5} radius={40} />
 */
export const Spotlight: React.FC<SpotlightProps> = ({
  x, y, radius, delay, duration, color, softness,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // Grow the radius from 0 to the target — pure spring, no overshoot.
  const currentRadius = interpolate(progress, [0, 1], [0, radius], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Map the % radius into pixels against the canvas's smaller dimension so the
  // spotlight reads the same regardless of aspect ratio.
  const minDimension = Math.min(width, height);
  const radiusPx = (currentRadius / 100) * minDimension;

  // Inside the lit disc, hold the colour for the first (100 - softness)% of the
  // radius, then fade to transparent across the last `softness`%. At softness
  // 100 it's a pure fade from centre to edge; at softness 0 it's a hard disc.
  const innerStopPx = radiusPx * (1 - softness / 100);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${color} 0px, ${color} ${innerStopPx}px, transparent ${radiusPx}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};
