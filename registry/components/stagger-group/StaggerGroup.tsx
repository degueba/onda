import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';

export const staggerGroupSchema = z.object({
  items: z
    .array(z.string())
    .default(['Less is more', 'Calm is power', 'Motion has a feel', 'Made to be edited']),
  delay: z.number().int().min(0).default(0),                // frames before the FIRST item starts
  stagger: z.number().int().min(0).default(STAGGER),        // frames between siblings (canonical = 4)
  duration: z.number().int().min(1).default(DURATION.base), // per-item reveal duration
  direction: z.enum(['column', 'row']).default('column'),
  gap: z.number().int().min(0).default(16),                 // px between items
  align: z.enum(['start', 'center', 'end']).default('center'),
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(48),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

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
