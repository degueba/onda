import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { gradientShiftSchema, type GradientShiftProps } from './schema';

export { gradientShiftSchema, type GradientShiftProps };

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
