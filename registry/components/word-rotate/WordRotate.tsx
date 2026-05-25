import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { HOUSE_EASE } from '../../../lib/easing';
import { resolveSize, PlacementBox } from '../../../lib/canvas';
import { wordRotateSchema, type WordRotateProps } from './schema';

export { wordRotateSchema, type WordRotateProps };

/**
 * Cycles through phrases in place. Each phrase rises in on `SPRING_SMOOTH`,
 * holds at full opacity, then fades down as the next arrives. One focal
 * element per moment — phrases are stacked at the same center point but only
 * one is visible at a time.
 *
 * @example
 * <WordRotate phrases={['fast', 'beautiful', 'restrained']} />
 */
export const WordRotate: React.FC<WordRotateProps> = ({
  phrases,
  delay,
  holdDuration,
  transitionDuration,
  color,
  fontSize,
  size,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  align = 'left',
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  // Each phrase's slot overlaps its neighbor's by `transitionDuration` —
  // the outgoing fade and the incoming fade share frames, so the swap
  // reads as one motion rather than two.
  const slot = holdDuration + transitionDuration;
  const justifySelf =
    align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'inline-grid', gridTemplateAreas: '"phrase"' }}>
        {phrases.map((phrase, i) => {
          const phraseStart = delay + i * slot;
          const local = frame - phraseStart;

          const rise = spring({
            frame: local,
            fps,
            config: SPRING_SMOOTH,
            durationInFrames: transitionDuration,
          });
          const translateY = interpolate(rise, [0, 1], [12, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const opacity = interpolate(
            local,
            [0, transitionDuration, transitionDuration + holdDuration, slot + transitionDuration],
            [0, 1, 1, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: HOUSE_EASE,
            },
          );

          return (
            <div
              key={i}
              style={{
                gridArea: 'phrase',
                justifySelf,
                opacity,
                transform: `translateY(${translateY}px)`,
                color,
                fontSize: resolvedFontSize,
                fontFamily,
                fontWeight,
                letterSpacing,
                lineHeight,
                textAlign: align,
                whiteSpace: 'nowrap',
              }}
            >
              {phrase}
            </div>
          );
        })}
      </div>
    </PlacementBox>
  );
};

export default WordRotate;
