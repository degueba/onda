import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { rotateInSchema, type RotateInProps } from './schema';

export { rotateInSchema, type RotateInProps };

/**
 * Text rotates from a slight starting angle to 0° while fading in, on the
 * house spring. Safe zone is `[-12°, +12°]`.
 *
 * @example
 * <RotateIn text="Onda" fromAngle={-8} />
 */
export const RotateIn: React.FC<RotateInProps> = ({
  text, delay, duration, fromAngle, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left',
  textTransform, textShadow, fontStyle, textWrap, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // spring-driven angle settle + opacity fade. No overshoot; small angle;
  // calm landing. Inline for now — candidate for an `entryRotate` helper in
  // lib/choreography.ts once a second component needs the same pattern.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const rotate = interpolate(progress, [0, 1], [fromAngle, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center',
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
        textTransform, textShadow, fontStyle, textWrap,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
