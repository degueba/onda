import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { entryScale } from '../../../lib/choreography';

/** Zod schema for {@link ScaleIn} props. */
export const scaleInSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Starting scale (settles to 1). Restrained: values below ~0.85 break the language. */
  fromScale: z.number().default(0.9),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link ScaleIn}. */
export type ScaleInProps = z.infer<typeof scaleInSchema>;

/**
 * A subtle scale-from-slightly-smaller-and-fade entrance. No overshoot, no
 * scale jumps — restrained on purpose.
 *
 * @example
 * <ScaleIn text="Onda" fromScale={0.9} />
 */
export const ScaleIn: React.FC<ScaleInProps> = ({
  text, delay, duration, fromScale, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity, transform } = entryScale({
    frame,
    fps,
    delay,
    durationInFrames: duration,
    from: fromScale,
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
