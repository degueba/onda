import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const gradientShiftSchema = z.object({
  from: z.string().default('#0E0E12'),                 // --onda-surface
  to: z.string().default('#1C1C22'),                   // --onda-border
  angle: z.number().default(135),                      // degrees, starting gradient angle
  speed: z.number().default(0.5),                      // degrees per frame — slow drift
  delay: z.number().int().min(0).default(0),           // frames before drift starts
});

export type GradientShiftProps = z.infer<typeof gradientShiftSchema>;

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
