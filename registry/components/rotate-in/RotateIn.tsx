import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

/** Zod schema for {@link RotateIn} props. */
export const rotateInSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle to 0°. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Starting angle in degrees. Safe zone: `[-12, +12]`. */
  fromAngle: z.number().default(-8),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link RotateIn}. */
export type RotateInProps = z.infer<typeof rotateInSchema>;

/**
 * Text rotates from a slight starting angle to 0° while fading in, on the
 * house spring. Safe zone is `[-12°, +12°]`.
 *
 * @example
 * <RotateIn text="Onda" fromAngle={-8} />
 */
export const RotateIn: React.FC<RotateInProps> = ({
  text, delay, duration, fromAngle, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // spring-driven angle settle + opacity fade. No overshoot; small angle;
  // calm landing. Inline for now — candidate for an `entryRotate` helper in
  // lib/choreography.ts once a second component needs the same pattern.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const rotate = interpolate(progress, [0, 1], [fromAngle, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      opacity,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'center',
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
