import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

/** Zod schema for {@link FadeIn} props — drives Remotion `defaultProps` validation. */
export const fadeInSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully reach opacity 1. Default `DURATION.base` (18). */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link FadeIn}. */
export type FadeInProps = z.infer<typeof fadeInSchema>;

/**
 * A pure opacity fade for text — no movement, no scale, no blur. The simplest
 * possible reveal in the Onda catalog, for moments where any other motion
 * would say too much.
 *
 * Motion: `entryFade` from `lib/choreography.ts` (`SPRING_SMOOTH`, clamped).
 *
 * @example
 * <FadeIn text="Onda" duration={18} />
 */
export const FadeIn: React.FC<FadeInProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity } = entryFade({ frame, fps, delay, durationInFrames: duration });

  return (
    <div style={{
      opacity,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};
