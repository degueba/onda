import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';

/** Zod schema for {@link WordStagger} props. */
export const wordStaggerSchema = z.object({
  /** The phrase. Split on whitespace into one reveal per word. */
  text: z.string().default('motion that moves you'),
  /** Frames before the **first** word starts. */
  delay: z.number().int().min(0).default(0),
  /** Per-word reveal duration. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Frames between consecutive words. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(64),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link WordStagger}. */
export type WordStaggerProps = z.infer<typeof wordStaggerSchema>;

/**
 * Multi-word text where each word fades and rises in sequence — the clearest
 * demonstration of the Onda stagger fingerprint.
 *
 * @example
 * <WordStagger text="motion that moves you" stagger={4} />
 */
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
