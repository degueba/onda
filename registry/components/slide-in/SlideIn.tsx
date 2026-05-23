import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entrySlide } from '../../../lib/choreography';

/** Zod schema for {@link SlideIn} props. */
export const slideInSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully settle into place. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** The settling direction. `'up'` means the element rises *into* place. */
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

/** Inferred props for {@link SlideIn}. */
export type SlideInProps = z.infer<typeof slideInSchema>;

/**
 * A direction-parameterized translate-and-fade entrance — text slides into
 * place from up, down, left, or right on the house spring.
 *
 * @example
 * <SlideIn text="Onda" direction="up" distance={12} />
 */
export const SlideIn: React.FC<SlideInProps> = ({
  text, delay, duration, direction, distance, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity, transform } = entrySlide({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    direction,
    distance,
  });

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
