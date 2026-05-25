import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { entrySlide } from '../../../lib/choreography';
import { PlacementBox } from '../../../lib/canvas';
import { slideInSchema, type SlideInProps } from './schema';

export { slideInSchema, type SlideInProps };

/**
 * A direction-parameterized translate-and-fade entrance — text slides into
 * place from up, down, left, or right on the house spring.
 *
 * @example
 * <SlideIn text="Onda" direction="up" distance={12} />
 */
export const SlideIn: React.FC<SlideInProps> = ({
  text, delay, duration, direction, distance, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
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
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        transform,
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
