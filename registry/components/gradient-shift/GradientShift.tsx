import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link GradientShift} props. */
export const gradientShiftSchema = z.object({
  /** Starting gradient color. Defaults to `--onda-surface`. */
  from: z.string().default('#0E0E12'),
  /** Ending gradient color. Defaults to `--onda-border`. */
  to: z.string().default('#1C1C22'),
  /** Starting angle in degrees. */
  angle: z.number().default(135),
  /** Rotation rate in degrees per frame. Keep low — atmospheric, not focal. */
  speed: z.number().default(0.5),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
});

/** Inferred props for {@link GradientShift}. */
export type GradientShiftProps = z.infer<typeof gradientShiftSchema>;

/**
 * A quiet, drifting two-color linear gradient background. The angle rotates
 * at a constant degrees-per-frame — linear-by-design (a spring would settle
 * and kill the drift). Low-saturation defaults keep it atmospheric, never focal.
 *
 * @example
 * <GradientShift from="#0E0E12" to="#1C1C22" speed={0.5} />
 */
export const GradientShift: React.FC<GradientShiftProps> = ({
  from, to, angle, speed, delay,
}) => {
  const frame = useCurrentFrame();

  // Linear-by-design: the angle is a pure function of (frame - delay), with no
  // spring driver. This component joins Typewriter / Marquee / KenBurns / Parallax
  // as the documented linear-by-design members of the catalog — a quiet, constant
  // drift is the whole point. Springs would settle and stop, killing the feel.
  const local = Math.max(0, frame - delay);
  const currentAngle = angle + speed * local;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${currentAngle}deg, ${from} 0%, ${to} 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
