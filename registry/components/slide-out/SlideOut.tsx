import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';

/** Zod schema for {@link SlideOut} props. */
export const slideOutSchema = z.object({
  /** What to slide out. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully leave. Defaults to `DURATION.fast` — exits are quicker than entrances. */
  duration: z.number().int().min(1).default(DURATION.fast),
  /** The direction the text leaves *toward*. `'up'` means it rises out of frame. */
  direction: z.enum(['up', 'down', 'left', 'right']).default('up'),
  /** Travel distance in px. Keep within the Onda envelope of 12–24. */
  distance: z.number().default(16),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link SlideOut}. */
export type SlideOutProps = z.infer<typeof slideOutSchema>;

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
    <div style={{
      opacity,
      transform,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
