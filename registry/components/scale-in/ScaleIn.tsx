import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entryScale } from '../../../lib/choreography';

export const scaleInSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.base), // frames to settle
  fromScale: z.number().default(0.9),                       // restrained but visible at preview scale
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type ScaleInProps = z.infer<typeof scaleInSchema>;

export const ScaleIn: React.FC<ScaleInProps> = ({
  text, delay, duration, fromScale, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity, transform } = entryScale({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    from: fromScale,
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
