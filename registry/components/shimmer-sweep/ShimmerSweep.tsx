import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { HOUSE_EASE } from '../../../lib/easing';
import { shimmerSweepSchema, type ShimmerSweepProps } from './schema';

export { shimmerSweepSchema, type ShimmerSweepProps };

/**
 * A single band of light sweeps across the text — restrained emphasis, not a
 * disco. The base text sits in `--onda-dim`; a brighter band travels through
 * once (or loops), drawing the eye without moving the layout.
 *
 * @example
 * <ShimmerSweep text="Shipping today" />
 */
export const ShimmerSweep: React.FC<ShimmerSweepProps> = ({
  text, delay, duration, loop, interval, color, shimmerColor, angle,
  fontSize, size, fontFamily, fontWeight, letterSpacing, lineHeight, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const local = frame - delay;
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const t = loop
    ? (((local % interval) + interval) % interval) / interval
    : interpolate(local, [0, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: HOUSE_EASE,
      });

  // The highlight band travels from off-right to off-left across the text.
  const posX = interpolate(t, [0, 1], [150, -50]);
  const gradient = `linear-gradient(${angle}deg, ${color} 40%, ${shimmerColor} 50%, ${color} 60%)`;

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          fontSize: resolvedFontSize,
          fontFamily,
          fontWeight,
          letterSpacing,
          lineHeight,
          textAlign: align,
          backgroundImage: gradient,
          backgroundSize: '250% 100%',
          backgroundPositionX: `${posX}%`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {text}
      </div>
    </PlacementBox>
  );
};
