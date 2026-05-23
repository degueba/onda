import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entrySlide } from '../../../lib/choreography';

export const slideInSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.base), // frames to fully settle
  direction: z.enum(['up', 'down', 'left', 'right']).default('up'),
  distance: z.number().default(16),                         // px — keep within 12–24
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type SlideInProps = z.infer<typeof slideInSchema>;

export const SlideIn: React.FC<SlideInProps> = ({
  text, delay, duration, direction, distance, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity, transform } = entrySlide({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    direction,
    distance,
  });

  return (
    <div style={{
      opacity,
      transform,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
