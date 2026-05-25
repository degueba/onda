import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { countUpSchema, type CountUpProps } from './schema';

export { countUpSchema, type CountUpProps };

/**
 * An animated number that counts from `from` to `to` on `SPRING_SMOOTH`.
 * Tabular nums, en-US grouping, deterministic across machines.
 *
 * @example
 * <CountUp from={0} to={1247} prefix="$" suffix="+" />
 */
export const CountUp: React.FC<CountUpProps> = ({
  from, to, delay, duration, decimals, prefix, suffix, color, fontSize, size, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  // Opacity rides the shared house spring via entryFade so the fade-in and
  // the counting curve settle together rather than racing each other.
  const { opacity } = entryFade({ frame, fps, delay, durationInFrames: duration });

  // Same SPRING_SMOOTH curve, computed independently so we can map it onto
  // the numeric range [from, to] without rebuilding the spring.
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const value = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Locale-grouped (thousands separators) by default. en-US is fixed so the
  // render is deterministic across machines regardless of host locale.
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        color, fontSize: resolvedFontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
        // tabular-nums keeps each digit slot a fixed width so the number
        // doesn't visibly shift left/right as digits change during the count.
        fontVariantNumeric: 'tabular-nums',
      }}>
        {prefix}{formatted}{suffix}
      </div>
    </PlacementBox>
  );
};
