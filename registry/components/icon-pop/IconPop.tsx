import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entryScale } from '../../../lib/choreography';

/** Zod schema for {@link IconPop} props. */
export const iconPopSchema = z.object({
  /** Which icon to render. */
  icon: z.enum(['check', 'cross', 'dot', 'star']).default('check'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Icon size in pixels (square). */
  size: z.number().default(96),
  /** Icon color. Defaults to `--onda-accent` (`#D96B82`) — accent earned. */
  color: z.string().default('#D96B82'),
  /** Stroke width for outline icons (check, cross). Ignored by filled icons. */
  strokeWidth: z.number().default(3),
});

/** Inferred props for {@link IconPop}. */
export type IconPopProps = z.infer<typeof iconPopSchema>;

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
  icon, delay, duration, size, color, strokeWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity, transform } = entryScale({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    from: 0,
  });

  const { d, filled } = ICONS[icon];

  return (
    <svg
      width={size}
      height={size}
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
  );
};
