import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';

export const wordStaggerSchema = z.object({
  text: z.string().default('motion that moves you'),
  delay: z.number().int().min(0).default(0),                // frames before the FIRST word starts
  duration: z.number().int().min(1).default(DURATION.base), // per-word reveal duration
  stagger: z.number().int().min(0).default(STAGGER),        // frames between words (canonical = 4)
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(64),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type WordStaggerProps = z.infer<typeof wordStaggerSchema>;

export const WordStagger: React.FC<WordStaggerProps> = ({
  text, delay, duration, stagger, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split on any run of whitespace; empty entries dropped so leading/trailing
  // spaces in the prop don't create ghost words that delay the cascade.
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '0.3em',
        color,
        fontSize,
        fontFamily,
        fontWeight: 600,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + staggerFrames(i, stagger);
        const localFrame = Math.max(0, frame - wordDelay);
        const { opacity, transform } = entryFadeRise({
          frame: localFrame,
          fps,
          durationInFrames: duration,
        });
        return (
          <span
            key={`${i}-${word}`}
            style={{
              display: 'inline-block',
              opacity,
              transform,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
