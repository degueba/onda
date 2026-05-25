import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { slideOutSchema, type SlideOutProps } from './schema';

export { slideOutSchema, type SlideOutProps };

/**
 * A direction-parameterized translate-and-fade exit — the mirror of `SlideIn`.
 * Text drifts off in the chosen direction while opacity fades to 0 on the
 * house spring. No overshoot; calm 16px travel.
 *
 * @example
 * <SlideOut text="Onda" direction="up" distance={16} />
 */
export const SlideOut: React.FC<SlideOutProps> = ({
  text, delay, duration, direction, distance, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // 0 → 1 over the exit window. At 0 the text is at rest; at 1 it's gone.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Travel from 0 → direction * distance. `up`/`left` are negative axes.
  const axis: 'x' | 'y' = (direction === 'left' || direction === 'right') ? 'x' : 'y';
  const sign = (direction === 'up' || direction === 'left') ? -1 : 1;
  const offset = interpolate(progress, [0, 1], [0, sign * distance], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const transform = axis === 'x' ? `translateX(${offset}px)` : `translateY(${offset}px)`;

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
