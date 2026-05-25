import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { blurRevealSchema, type BlurRevealProps } from './schema';

export { blurRevealSchema, type BlurRevealProps };

/**
 * The reference Onda primitive: opacity, blur, and a 16px rise settle
 * together on `SPRING_SMOOTH` with no overshoot. Quietly cinematic.
 *
 * @example
 * <BlurReveal text="Onda" duration={20} />
 */
export const BlurReveal: React.FC<BlurRevealProps> = ({
  text, delay, duration, color, fontSize, size, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left',
  textTransform, textShadow, fontStyle, textWrap, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${translateY}px)`,
        color, fontSize: resolvedFontSize, fontFamily,
        fontWeight, letterSpacing, lineHeight,
        textAlign: align,
        textTransform, textShadow, fontStyle, textWrap,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
