import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { entryScale } from '../../../lib/choreography';
import { PlacementBox } from '../../../lib/canvas';
import { scaleInSchema, type ScaleInProps } from './schema';

export { scaleInSchema, type ScaleInProps };

/**
 * A subtle scale-from-slightly-smaller-and-fade entrance. No overshoot, no
 * scale jumps — restrained on purpose.
 *
 * @example
 * <ScaleIn text="Onda" fromScale={0.9} />
 */
export const ScaleIn: React.FC<ScaleInProps> = ({
  text, delay, duration, fromScale, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left',
  textTransform, textShadow, fontStyle, textWrap, placement,
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
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        transform,
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
        textTransform, textShadow, fontStyle, textWrap,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
