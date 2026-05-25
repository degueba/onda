import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { trackingInSchema, type TrackingInProps } from './schema';

export { trackingInSchema, type TrackingInProps };

/**
 * The text begins spread wide and contracts to its resting tracking on the
 * house spring, fading (and optionally sharpening from a soft blur) as it
 * settles. A confident, cinematic title entrance — no overshoot.
 *
 * @example
 * <TrackingIn text="ONDA" />
 */
export const TrackingIn: React.FC<TrackingInProps> = ({
  text, delay, duration, color, fromTracking, tracking, blur,
  fontSize, size, fontFamily, fontWeight, lineHeight, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const progress = spring({ frame: local, fps, config: SPRING_SMOOTH, durationInFrames: duration });
  const opacity = interpolate(progress, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ls = interpolate(progress, [0, 1], [fromTracking, tracking], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blurPx = blur ? interpolate(progress, [0, 1], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          opacity,
          color,
          fontSize: resolvedFontSize,
          fontFamily,
          fontWeight,
          lineHeight,
          textAlign: align,
          letterSpacing: `${ls}em`,
          filter: blurPx ? `blur(${blurPx}px)` : undefined,
        }}
      >
        {text}
      </div>
    </PlacementBox>
  );
};
