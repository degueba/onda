import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

export const fadeInSchema = z.object({
  text: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.base), // frames to fully reveal
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type FadeInProps = z.infer<typeof fadeInSchema>;

export const FadeIn: React.FC<FadeInProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity } = entryFade({ frame, fps, delay, durationInFrames: duration });

  return (
    <div style={{
      opacity,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
