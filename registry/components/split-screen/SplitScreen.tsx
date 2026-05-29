import React from 'react';
import { PlacementBox } from '../../../lib/canvas';
import { useEntrance } from '../../../lib/hooks';
import { splitScreenSchema, type SplitScreenSchemaProps } from './schema';

export { splitScreenSchema };

/**
 * Props for {@link SplitScreen}: the serializable schema props plus the two
 * content panes. Like `browser-frame` / `device-frame`'s `children`, the
 * `left` / `right` `ReactNode`s can't be Zod-validated, so they live only here.
 */
export type SplitScreenProps = SplitScreenSchemaProps & {
  /** Content for the left (or top) pane. */
  left?: React.ReactNode;
  /** Content for the right (or bottom) pane. */
  right?: React.ReactNode;
};

const DIVIDER = 'var(--onda-border, #1C1C22)';
const PANE_BG = 'var(--onda-surface, #0E0E12)';
const PLACEHOLDER = 'var(--onda-faint, #56565F)';

function Pane({
  content,
  style,
  flex,
  label,
}: {
  content: React.ReactNode;
  style: { opacity: number; transform: string };
  flex: number;
  label: string;
}) {
  return (
    <div
      style={{
        flex: `${flex} 1 0`,
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
        background: PANE_BG,
        opacity: style.opacity,
        transform: style.transform,
      }}
    >
      {content ?? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            color: PLACEHOLDER,
            fontFamily: 'var(--onda-font-body, "Space Grotesk", sans-serif)',
            fontSize: 28,
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * A two-pane split layout — `left` and `right` content panes (any JSX) divided
 * by a thin token line. A **container**, the documented exception to the
 * "self-contained" rule, since wrapping arbitrary content is its whole job.
 * When `animate`, the two panes slide in from their outer edges on the house
 * spring (a 16px settle), each from the opposite side.
 *
 * @example
 * <SplitScreen left={<Before />} right={<After />} placement="center" />
 */
export const SplitScreen: React.FC<SplitScreenProps> = ({
  left,
  right,
  orientation,
  ratio,
  gap,
  divider,
  animate,
  delay,
  width,
  height,
  placement,
}) => {
  const horizontal = orientation === 'horizontal';

  // Panes settle in from their outer edges: left from the left, right from the
  // right (or top/bottom when vertical). House spring, 16px travel.
  const leftEntrance = useEntrance({
    type: 'slide',
    delay,
    direction: horizontal ? 'left' : 'up',
    distance: 16,
  });
  const rightEntrance = useEntrance({
    type: 'slide',
    delay,
    direction: horizontal ? 'right' : 'down',
    distance: 16,
  });

  const still = { opacity: 1, transform: 'none' };
  const leftStyle = animate ? leftEntrance : still;
  const rightStyle = animate ? rightEntrance : still;

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          gap,
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--onda-bg, #08080A)',
        }}
      >
        <Pane content={left} style={leftStyle} flex={ratio} label={horizontal ? 'Left' : 'Top'} />
        {divider && (
          <div
            style={{
              flex: '0 0 auto',
              alignSelf: 'stretch',
              background: DIVIDER,
              ...(horizontal ? { width: 1 } : { height: 1 }),
            }}
          />
        )}
        <Pane content={right} style={rightStyle} flex={1 - ratio} label={horizontal ? 'Right' : 'Bottom'} />
      </div>
    </PlacementBox>
  );
};

export default SplitScreen;
