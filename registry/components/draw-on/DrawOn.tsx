import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

export const drawOnSchema = z.object({
  d: z.string().default('M 10 50 Q 100 10 190 50'),       // gentle wave — on-brand default
  delay: z.number().int().min(0).default(0),              // frames before start
  duration: z.number().int().min(1).default(DURATION.slow), // frames to fully stroke in
  stroke: z.string().default('#F2F2F4'),                  // --onda-text
  strokeWidth: z.number().default(3),
  viewBox: z.string().default('0 0 200 100'),             // matches default d
  width: z.number().default(800),
  height: z.number().default(400),
});

export type DrawOnProps = z.infer<typeof drawOnSchema>;

export const DrawOn: React.FC<DrawOnProps> = ({
  d, delay, duration, stroke, strokeWidth, viewBox, width, height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // SPRING_SMOOTH-driven progress 0 → 1 keeps the stroke calm and settled.
  // No overshoot: the line lands at full length and stays — the Onda fingerprint.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // evolvePath translates a 0–1 progress into the dasharray/dashoffset pair
  // needed to "draw" the path from its start to its end.
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);

  return (
    <svg viewBox={viewBox} width={width} height={height} style={{ overflow: 'visible' }}>
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
