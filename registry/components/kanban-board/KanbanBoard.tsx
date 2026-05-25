import React from 'react';
import { useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useStaggeredEntrance } from '../../../lib/hooks';
import { kanbanBoardSchema, type KanbanBoardProps } from './schema';

export { kanbanBoardSchema, type KanbanBoardProps };

/**
 * A data-driven Kanban board — glass `Surface` columns, each with a header,
 * a status dot, a ticket count, and a stack of small glass ticket cards. Every
 * card rises + fades in on the house spring, staggered across the whole board
 * (left-to-right, top-to-bottom) so it assembles as one calm cascade rather
 * than popping all at once. The board is static after the entrance — any
 * "flying ticket" between columns is the consumer's job, not this component's.
 * Self-contained except the shared `Surface` primitive and the
 * `useStaggeredEntrance` hook.
 *
 * @example
 * <KanbanBoard placement="center" />
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  width,
  gap,
  delay,
  stagger,
  fontSize,
  size,
  fontFamily,
  placement,
}) => {
  const { width: canvasW, height: canvasH } = useVideoConfig();
  const headerSize = size ? resolveSize(size, { width: canvasW, height: canvasH }) : fontSize;
  const cardSize = Math.round(headerSize * 0.82);
  const dim = '#8E8E98';
  const faint = '#56565F';
  // One hook call, then a per-index entrance — never a hook in a loop. A flat
  // running index across all cards keeps the cascade reading left-to-right,
  // top-to-bottom across the whole board.
  const at = useStaggeredEntrance({ type: 'rise', delay, increment: stagger });

  let cardIndex = 0;

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'flex', gap, width, alignItems: 'stretch' }}>
        {columns.map((column, ci) => {
          const accent = column.accent ?? faint;
          return (
            <div key={ci} style={{ flex: 1, minWidth: 0 }}>
              <Surface variant="glass" padding={Math.round(gap * 0.9)} height="100%">
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Column header — status dot, title, ticket count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: gap,
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: Math.round(cardSize * 0.42),
                        height: Math.round(cardSize * 0.42),
                        borderRadius: '50%',
                        background: accent,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        color: '#F2F2F4',
                        fontFamily,
                        fontSize: headerSize,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {column.title}
                    </div>
                    <div
                      style={{
                        color: column.accent ? accent : faint,
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: Math.round(cardSize * 0.78),
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                        lineHeight: 1,
                      }}
                    >
                      {column.cards.length}
                    </div>
                  </div>

                  {/* Ticket cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(gap * 0.6) }}>
                    {column.cards.map((label, ti) => {
                      const entrance = at(cardIndex);
                      cardIndex += 1;
                      return (
                        <div
                          key={ti}
                          style={{ opacity: entrance.opacity, transform: entrance.transform }}
                        >
                          <Surface variant="card" padding={Math.round(gap * 0.7)} shadow="none">
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <div
                                aria-hidden
                                style={{
                                  width: 3,
                                  alignSelf: 'stretch',
                                  minHeight: cardSize,
                                  borderRadius: 2,
                                  background: accent,
                                  opacity: column.accent ? 0.9 : 0.4,
                                  flexShrink: 0,
                                }}
                              />
                              <div
                                style={{
                                  color: dim,
                                  fontFamily: '"Space Grotesk", sans-serif',
                                  fontSize: cardSize,
                                  fontWeight: 400,
                                  lineHeight: 1.35,
                                }}
                              >
                                {label}
                              </div>
                            </div>
                          </Surface>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Surface>
            </div>
          );
        })}
      </div>
    </PlacementBox>
  );
};

export default KanbanBoard;
