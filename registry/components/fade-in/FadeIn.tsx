import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { entryFade } from '../../../lib/choreography';
import { PlacementBox } from '../../../lib/canvas';
import { fadeInSchema, type FadeInProps } from './schema';

export { fadeInSchema, type FadeInProps };

/**
 * A pure opacity fade for text — no movement, no scale, no blur. The simplest
 * possible reveal in the Onda catalog, for moments where any other motion
 * would say too much.
 *
 * Motion: `entryFade` from `lib/choreography.ts` (`SPRING_SMOOTH`, clamped).
 *
 * @example
 * <FadeIn text="Onda" duration={18} />
 */
export const FadeIn: React.FC<FadeInProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity } = entryFade({ frame, fps, delay, durationInFrames: duration });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
