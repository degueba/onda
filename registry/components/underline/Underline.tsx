import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

export const underlineSchema = z.object({
  text: z.string().default('underline this'),
  delay: z.number().int().min(0).default(0),                    // frames before start
  duration: z.number().int().min(1).default(DURATION.base),     // text reveal duration
  lineDelay: z.number().int().min(0).default(8),                // frames after text appears before underline starts drawing
  lineDuration: z.number().int().min(1).default(DURATION.fast), // underline draws fast — emphatic
  color: z.string().default('#F2F2F4'),                         // --onda-text
  accentColor: z.string().default('#D96B82'),                   // --onda-accent; the catalog's accent rose
  lineThickness: z.number().default(3),                         // px stroke
  lineOffset: z.number().default(6),                            // px gap between text baseline and the line
  fontSize: z.number().default(64),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type UnderlineProps = z.infer<typeof underlineSchema>;

export const Underline: React.FC<UnderlineProps> = ({
  text,
  delay,
  duration,
  lineDelay,
  lineDuration,
  color,
  accentColor,
  lineThickness,
  lineOffset,
  fontSize,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: text fade — opacity 0 → 1 on SPRING_SMOOTH.
  const { opacity } = entryFade({
    frame,
    fps,
    delay,
    durationInFrames: duration,
  });

  // Phase 2: underline draws after the text has landed, offset by lineDelay.
  const lineProgress = spring({
    frame: Math.max(0, frame - delay - lineDelay),
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: lineDuration,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          opacity,
          color,
          fontSize,
          fontFamily,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: -(lineOffset + lineThickness),
          height: lineThickness,
          width: `${lineWidth}%`,
          backgroundColor: accentColor,
          borderRadius: lineThickness / 2,
        }}
      />
    </div>
  );
};
