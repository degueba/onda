import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { HOUSE_EASE } from '../../../lib/easing';
import { sizeRoleSchema, resolveSize, PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link WordRotate} props — drives Remotion `defaultProps` validation. */
export const wordRotateSchema = z.object({
  /** Phrases cycled in place, in order. One is visible at a time. */
  phrases: z.array(z.string()).default(['fast', 'beautiful', 'restrained']),
  /** Frames before the first phrase begins to enter. */
  delay: z.number().int().min(0).default(0),
  /** Frames each phrase holds at full opacity before the next arrives. */
  holdDuration: z.number().int().min(1).default(30),
  /** Frames for a single phrase to fade in (and, separately, fade out). */
  transitionDuration: z.number().int().min(1).default(12),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(96),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing. Default `'-0.02em'` matches the brand's tight display tracking. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1`. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link WordRotate}. */
export type WordRotateProps = z.infer<typeof wordRotateSchema>;

/**
 * Cycles through phrases in place. Each phrase rises in on `SPRING_SMOOTH`,
 * holds at full opacity, then fades down as the next arrives. One focal
 * element per moment — phrases are stacked at the same center point but only
 * one is visible at a time.
 *
 * @example
 * <WordRotate phrases={['fast', 'beautiful', 'restrained']} />
 */
export const WordRotate: React.FC<WordRotateProps> = ({
  phrases,
  delay,
  holdDuration,
  transitionDuration,
  color,
  fontSize,
  size,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  align = 'left',
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  // Each phrase's slot overlaps its neighbor's by `transitionDuration` —
  // the outgoing fade and the incoming fade share frames, so the swap
  // reads as one motion rather than two.
  const slot = holdDuration + transitionDuration;
  const justifySelf =
    align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'inline-grid', gridTemplateAreas: '"phrase"' }}>
        {phrases.map((phrase, i) => {
          const phraseStart = delay + i * slot;
          const local = frame - phraseStart;

          const rise = spring({
            frame: local,
            fps,
            config: SPRING_SMOOTH,
            durationInFrames: transitionDuration,
          });
          const translateY = interpolate(rise, [0, 1], [12, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const opacity = interpolate(
            local,
            [0, transitionDuration, transitionDuration + holdDuration, slot + transitionDuration],
            [0, 1, 1, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: HOUSE_EASE,
            },
          );

          return (
            <div
              key={i}
              style={{
                gridArea: 'phrase',
                justifySelf,
                opacity,
                transform: `translateY(${translateY}px)`,
                color,
                fontSize: resolvedFontSize,
                fontFamily,
                fontWeight,
                letterSpacing,
                lineHeight,
                textAlign: align,
                whiteSpace: 'nowrap',
              }}
            >
              {phrase}
            </div>
          );
        })}
      </div>
    </PlacementBox>
  );
};

export default WordRotate;
