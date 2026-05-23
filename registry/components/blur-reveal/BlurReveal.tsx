import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

export const blurRevealSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.base), // frames to fully reveal
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type BlurRevealProps = z.infer<typeof blurRevealSchema>;

export const BlurReveal: React.FC<BlurRevealProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
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

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      opacity,
      filter: `blur(${blur}px)`,
      transform: `translateY(${translateY}px)`,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
