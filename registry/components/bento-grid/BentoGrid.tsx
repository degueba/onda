import React from 'react';
import { useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useStaggeredEntrance } from '../../../lib/hooks';
import { bentoGridSchema, type BentoGridProps } from './schema';

export { bentoGridSchema, type BentoGridProps };

/**
 * A data-driven bento layout — a CSS grid of glass `Surface` cards with varying
 * column/row spans. Each cell rises + fades in on the house spring, staggered
 * left-to-right so the grid assembles as one calm cascade rather than popping
 * all at once. Pass `items` to drive the content; the one `accent` cell earns
 * the rose. Self-contained except the shared `Surface` primitive and the
 * `useStaggeredEntrance` hook.
 *
 * @example
 * <BentoGrid placement="center" />
 */
export const BentoGrid: React.FC<BentoGridProps> = ({
  items,
  columns,
  gap,
  width,
  padding,
  delay,
  stagger,
  fontSize,
  size,
  color,
  captionColor,
  accentColor,
  fontFamily,
  placement,
}) => {
  const { width: canvasW, height: canvasH } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width: canvasW, height: canvasH }) : fontSize;
  // One hook call, then a per-index entrance — never a hook in a loop.
  const at = useStaggeredEntrance({ type: 'rise', delay, increment: stagger });

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridAutoRows: '1fr',
          gap,
          width,
        }}
      >
        {items.map((item, i) => {
          const entrance = at(i);
          const colSpan = Math.min(item.colSpan, columns);
          return (
            <div
              key={i}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${item.rowSpan}`,
                opacity: entrance.opacity,
                transform: entrance.transform,
              }}
            >
              <Surface
                variant="glass"
                padding={padding}
                height="100%"
                borderColor={item.accent ? accentColor : undefined}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '100%',
                    gap: 8,
                  }}
                >
                  {item.value && (
                    <div
                      style={{
                        color: item.accent ? accentColor : color,
                        fontFamily,
                        fontSize: resolvedFontSize * 1.8,
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </div>
                  )}
                  <div
                    style={{
                      color,
                      fontFamily,
                      fontSize: resolvedFontSize,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.caption && (
                    <div
                      style={{
                        color: captionColor,
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: Math.round(resolvedFontSize * 0.56),
                        lineHeight: 1.45,
                      }}
                    >
                      {item.caption}
                    </div>
                  )}
                </div>
              </Surface>
            </div>
          );
        })}
      </div>
    </PlacementBox>
  );
};

export default BentoGrid;
