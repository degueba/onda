import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { wordStaggerSchema, type WordStaggerProps } from './schema';

export { wordStaggerSchema, type WordStaggerProps };

/**
 * Multi-word text where each word fades and rises in sequence — the clearest
 * demonstration of the Onda stagger fingerprint.
 *
 * @example
 * <WordStagger text="motion that moves you" stagger={4} />
 */
export const WordStagger: React.FC<WordStaggerProps> = ({
  text, delay, duration, stagger, justify, color, fontSize, size, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  // Split on any run of whitespace; empty entries dropped so leading/trailing
  // spaces in the prop don't create ghost words that delay the cascade.
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          // `justifyContent` centers each wrapped line independently when
          // flex-wrap is on — that's what makes a wrapped pull-quote read as
          // a centered block instead of a left-anchored ragged paragraph.
          justifyContent: justify,
          gap: '0.3em',
          color,
          fontSize: resolvedFontSize,
          fontFamily,
          fontWeight,
          letterSpacing,
          lineHeight,
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
    </PlacementBox>
  );
};
