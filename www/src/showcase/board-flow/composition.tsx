'use client';

import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing } from 'remotion';
import { KanbanBoard, kanbanBoardSchema } from '@onda/registry/components/kanban-board/KanbanBoard';
import { Confetti, confettiSchema } from '@onda/registry/components/confetti/Confetti';
import { CountUp, countUpSchema } from '@onda/registry/components/count-up/CountUp';
import { Surface } from '@onda/lib/index';

// Board geometry (must match the KanbanBoard props below):
// canvas 1280×720, board width 1040 centered → left edge at (1280-1040)/2 = 120.
// 3 columns, gap 20 → each column = (1040 - 2*20)/3 = 333.33px.
// Column center X = 120 + i*(333.33 + 20) + 166.67.
const COL_X = [286.7, 640, 993.3]; // Todo · In Progress · Done
// The board is vertically centered; its header sits just above canvas-center, so
// the flying card travels a touch below center to glide through the card body
// (not over the headers). In Progress + Done are left empty so the card lands in
// clear space rather than on top of a static ticket.
const FLY_Y = 412;
const CARD_W = 220;
const CARD_H = 64;

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// The flying ticket: a small glass Surface that travels Todo → In Progress →
// Done on a deterministic, eased arc keyed entirely off useCurrentFrame() — no
// state, no random. A gentle dip + rotate sells the hand-off between columns.
const FlyingTicket: React.FC = () => {
  const frame = useCurrentFrame();

  // Three legs, clamped: hold in Todo, glide to In Progress, glide to Done.
  const x = interpolate(
    frame,
    [24, 70, 110, 150],
    [COL_X[0], COL_X[1], COL_X[1], COL_X[2]],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE },
  );
  // Slight arc — the card lifts on each hand-off, then settles.
  const dip = interpolate(
    frame,
    [24, 47, 70, 90, 110, 130, 150],
    [0, -20, 0, 0, -20, 0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE },
  );
  const rotate = interpolate(
    frame,
    [24, 47, 70, 110, 130, 150],
    [0, -5, 0, 0, 5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE },
  );
  // Fade in on entrance; the card stays put once it lands in Done.
  const opacity = interpolate(frame, [16, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x - CARD_W / 2,
        top: FLY_Y + dip - CARD_H / 2,
        width: CARD_W,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <Surface variant="glass" padding={16} radius={14} shadow="lifted">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 3,
              alignSelf: 'stretch',
              minHeight: 28,
              borderRadius: 2,
              background: '#D96B82',
            }}
          />
          <div
            style={{
              color: '#F2F2F4',
              fontFamily: '"Clash Display", sans-serif',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Ship the render
          </div>
        </div>
      </Surface>
    </div>
  );
};

// A board, a single ticket flowing across it, and a confetti payoff the moment
// it lands in Done. A small count-up plays an "in progress" timer beneath.
export const BoardFlowComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
      <KanbanBoard
        {...kanbanBoardSchema.parse({
          columns: [
            { title: 'Todo', cards: ['Storyboard intro', 'Source b-roll'] },
            { title: 'In Progress', accent: '#D96B82', cards: [] },
            { title: 'Done', cards: [] },
          ],
          width: 1040,
          gap: 20,
          placement: 'center',
        })}
      />

      <FlyingTicket />

      {/* "In progress" timer — small, beneath the board, during the middle leg */}
      <Sequence from={70} durationInFrames={50}>
        <CountUp
          {...countUpSchema.parse({
            from: 0,
            to: 100,
            suffix: '%',
            duration: 40,
            fontSize: 40,
            color: '#8E8E98',
            align: 'center',
            placement: { x: 0.5, y: 0.86, anchor: 'center' },
          })}
        />
      </Sequence>

      {/* Payoff — the card has landed in Done, burst over the Done column */}
      <Sequence from={150}>
        <Confetti
          {...confettiSchema.parse({
            originX: 993.3 / 1280,
            originY: FLY_Y / 720,
            count: 90,
            spread: 130,
          })}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
