import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { staggerFrames } from '../../../lib/motion';
import { entryFadeRise } from '../../../lib/choreography';
import { PlacementBox } from '../../../lib/canvas';
import { staggerGroupSchema, type StaggerGroupProps } from './schema';

export { staggerGroupSchema, type StaggerGroupProps };

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
  fontWeight = 600,
  letterSpacing = 'normal',
  lineHeight = 1.1,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PlacementBox placement={placement}>
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
        fontWeight,
        letterSpacing,
        lineHeight,
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
    </PlacementBox>
  );
};
