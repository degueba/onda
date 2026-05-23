import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

/** Zod schema for {@link Spotlight} props — drives Remotion `defaultProps` validation. */
export const spotlightSchema = z.object({
  /** Horizontal centre of the spotlight as a 0–1 fraction of canvas width. */
  x: z.number().min(0).max(1).default(0.5),
  /** Vertical centre of the spotlight as a 0–1 fraction of canvas height. */
  y: z.number().min(0).max(1).default(0.5),
  /** Final radius as a percentage of the canvas's smaller dimension. */
  radius: z.number().min(0).default(40),
  /** Frames before the reveal starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until the spotlight reaches its full radius. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Light colour. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Gradient softness — % of the radius given over to the fade-to-transparent tail. */
  softness: z.number().min(0).max(100).default(60),
  /** Canvas width in pixels — used to map the % radius into a pixel value. */
  canvasWidth: z.number().int().min(1).default(1920),
  /** Canvas height in pixels — used to map the % radius into a pixel value. */
  canvasHeight: z.number().int().min(1).default(1080),
});

/** Inferred props for {@link Spotlight}. */
export type SpotlightProps = z.infer<typeof spotlightSchema>;

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
  x, y, radius, delay, duration, color, softness, canvasWidth, canvasHeight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
  const minDimension = Math.min(canvasWidth, canvasHeight);
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
