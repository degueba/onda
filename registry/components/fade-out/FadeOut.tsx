import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { HOUSE_EASE } from '../../../lib/easing';

/** Zod schema for {@link FadeOut} props — drives Remotion `defaultProps` validation. */
export const fadeOutSchema = z.object({
  /** What to fade out. */
  text: z.string().default('Onda'),
  /** Frames before the fade begins. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully reach opacity 0. Default `DURATION.fast` (10) — exits are quicker than entrances. */
  duration: z.number().int().min(1).default(DURATION.fast),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link FadeOut}. */
export type FadeOutProps = z.infer<typeof fadeOutSchema>;

/**
 * The inverse of {@link FadeIn}: a pure opacity exit. Opacity goes from 1 to 0
 * starting at `delay`, eased on `HOUSE_EASE`. Slightly faster than entrances
 * (`DURATION.fast`) so the moment ends without lingering — restraint applied
 * to exits as well.
 *
 * Motion is opacity-only by design — no transform, no blur, no scale. Per
 * `CLAUDE.md §4`, `HOUSE_EASE` on `interpolate` is the canonical curve for
 * fades.
 *
 * @example
 * <FadeOut text="Onda" delay={30} duration={10} />
 */
export const FadeOut: React.FC<FadeOutProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - delay);

  const opacity = interpolate(local, [0, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });

  return (
    <div style={{
      opacity,
      color, fontSize, fontFamily, fontWeight: 600,
    }}>
      {text}
    </div>
  );
};

export default FadeOut;
