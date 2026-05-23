import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';

/** Zod schema for {@link StaggerGroup} props. */
export const staggerGroupSchema = z.object({
  /** The items to reveal, in order. */
  items: z
    .array(z.string())
    .default(['Less is more', 'Calm is power', 'Motion has a feel', 'Made to be edited']),
  /** Frames before the **first** item starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames between consecutive items. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /** Per-item reveal duration. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Layout direction for the items. */
  direction: z.enum(['column', 'row']).default('column'),
  /** Pixels between items. */
  gap: z.number().int().min(0).default(16),
  /** Cross-axis alignment. */
  align: z.enum(['start', 'center', 'end']).default('center'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(48),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link StaggerGroup}. */
export type StaggerGroupProps = z.infer<typeof staggerGroupSchema>;

// Map align prop to the corresponding flexbox value. Kept inline + tiny so the
// component stays a single pure function with no helper-file surface area.
const ALIGN_TO_FLEX = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
} as const;

const ALIGN_TO_TEXT = {
  start: 'left',
  center: 'center',
  end: 'right',
} as const;

/**
 * The composition primitive — reveals a list of items in sequence using the
 * canonical Onda stagger (`4` frames between siblings). The foundation for
 * animated lists and sequenced reveals.
 *
 * @example
 * <StaggerGroup items={['One', 'Two', 'Three']} stagger={4} />
 */
export const StaggerGroup: React.FC<StaggerGroupProps> = ({
  items,
  delay,
  stagger,
  duration,
  direction,
  gap,
  align,
  color,
  fontSize,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: ALIGN_TO_FLEX[align],
        justifyContent: ALIGN_TO_FLEX[align],
        gap: `${gap}px`,
        textAlign: ALIGN_TO_TEXT[align],
        color,
        fontSize,
        fontFamily,
        fontWeight: 600,
      }}
    >
      {items.map((item, i) => {
        const itemDelay = delay + staggerFrames(i, stagger);
        const localFrame = Math.max(0, frame - itemDelay);
        const { opacity, transform } = entryFadeRise({
          frame: localFrame,
          fps,
          durationInFrames: duration,
        });
        return (
          <span
            key={`${i}-${item}`}
            style={{
              // inline-block is mandatory: translateY from entryFadeRise has
              // no effect on inline elements.
              display: 'inline-block',
              opacity,
              transform,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
};
