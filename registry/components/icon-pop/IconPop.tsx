import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { entryScale } from '../../../lib/choreography';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { iconPopSchema, type IconPopProps } from './schema';

export { iconPopSchema, type IconPopProps };

/**
 * Path data for each icon variant, expressed inside the 0–24 viewBox.
 * Outline icons (`check`, `cross`) are stroked; filled icons (`dot`, `star`)
 * are filled. Kept inline so the component stays self-contained.
 */
const ICONS: Record<
  IconPopProps['icon'],
  { d: string; filled: boolean }
> = {
  check: { d: 'M5 13l4 4L19 7', filled: false },
  cross: { d: 'M6 6 L18 18 M6 18 L18 6', filled: false },
  dot: { d: 'M12 12 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', filled: true },
  star: {
    d: 'M12 2 L14.9 8.9 L22.4 9.5 L16.7 14.4 L18.5 21.7 L12 17.8 L5.5 21.7 L7.3 14.4 L1.6 9.5 L9.1 8.9 Z',
    filled: true,
  },
};

/**
 * A small icon — check, cross, dot, or star — that pops into place on
 * `SPRING_SMOOTH` via {@link entryScale} (scale 0 → 1 plus opacity fade).
 * Universal state primitive; the accent is earned (the icon itself is the
 * single accent moment). No overshoot, no flourish.
 *
 * @example
 * <IconPop icon="check" />
 */
export const IconPop: React.FC<IconPopProps> = ({
  icon, delay, duration, iconSize, size, color, strokeWidth, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedSize = size ? resolveSize(size, { width, height }) : iconSize;

  const { opacity, transform } = entryScale({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    from: 0,
  });

  const { d, filled } = ICONS[icon];

  return (
    <PlacementBox placement={placement}>
      <svg
        width={resolvedSize}
        height={resolvedSize}
        viewBox="0 0 24 24"
        style={{ opacity, transform }}
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </PlacementBox>
  );
};
