import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

export const rotateInSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.base), // frames to fully reveal
  fromAngle: z.number().default(-8),                        // degrees — safe zone [-12, +12]
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type RotateInProps = z.infer<typeof rotateInSchema>;

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
