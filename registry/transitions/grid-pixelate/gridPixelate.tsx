import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { seededRandom } from '../../../lib/random';
import { gridPixelateSchema, type GridPixelateOptions } from './schema';

export { gridPixelateSchema, type GridPixelateOptions };

type GridPixelateProps = { cols: number; rows: number; seed: number; color: string };

// How long (in progress units) a single cell takes to flip.
const RAMP = 0.16;

const GridPixelatePresentation: React.FC<
  TransitionPresentationComponentProps<GridPixelateProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { cols, rows, seed, color } = passedProps;
  const count = cols * rows;
  const isEntering = presentationDirection === 'entering';

  // Deterministic per-cell reveal threshold — same sequence every render.
  const rand = seededRandom(seed);
  const thresholds = Array.from({ length: count }, () => rand() * (1 - RAMP));

  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {thresholds.map((th, i) => {
          const reveal = Math.min(1, Math.max(0, (presentationProgress - th) / RAMP));
          // Entering: cells start covering, flip to revealed. Exiting: cover up.
          const cover = isEntering ? 1 - reveal : reveal;
          return <div key={i} style={{ background: color, opacity: cover }} />;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The scene breaks into a grid of cells that flip in a seeded scatter — the
 * outgoing scene pixelates away to canvas while the incoming assembles from
 * it. Deterministic cell order (seeded), so the scatter is identical every
 * render. A retro, high-energy cut.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function gridPixelate(
  options?: GridPixelateOptions,
): TransitionPresentation<GridPixelateProps> {
  const opts = gridPixelateSchema.parse(options ?? {});
  return {
    component: GridPixelatePresentation,
    props: { cols: opts.cols, rows: opts.rows, seed: opts.seed, color: opts.color },
  };
}

export default gridPixelate;
