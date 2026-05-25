import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useEntrance } from '../../../lib/hooks';
import { skeletonCardSchema, type SkeletonCardProps } from './schema';

export { skeletonCardSchema, type SkeletonCardProps };

// Deterministic bar widths — a fixed repeating pattern keyed off the bar
// index (CLAUDE.md §1: no Math.random). Reads as "real" placeholder copy:
// a full line, then progressively shorter ones, then back. Pure function of i.
const BAR_WIDTHS = ['100%', '92%', '74%', '85%', '60%'];
const barWidth = (i: number): string => BAR_WIDTHS[i % BAR_WIDTHS.length];

/**
 * A loading-placeholder card — the "still generating / not loaded yet" state
 * shown before content populates. A glass `Surface` holds an optional
 * thumbnail block plus a stack of text bars, with a single highlight band
 * sweeping across them on a frame-driven loop (like `ShimmerSweep`, but a
 * moving sheen over the bars rather than a text clip). The card rises in on
 * the house spring; the shimmer keeps moving so the placeholder feels live.
 *
 * @example
 * <SkeletonCard placement="center" />
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines,
  thumbnail,
  shimmerSpeed,
  shimmerColor,
  barColor,
  delay,
  width,
  height,
  size,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { width: cw, height: ch } = useVideoConfig();
  const entrance = useEntrance({ type: 'rise', delay });
  const local = frame - delay;

  // Base bar height — semantic role wins, else a token-paced default.
  const barHeight = size ? resolveSize(size, { width: cw, height: ch }) : 18;
  const gap = Math.round(barHeight * 0.9);

  // The highlight band travels left → right on a continuous loop. A pure
  // function of the frame (CLAUDE.md §1) — no state, identical every render.
  const t = (((local % shimmerSpeed) + shimmerSpeed) % shimmerSpeed) / shimmerSpeed;
  const posX = interpolate(t, [0, 1], [-50, 150]);
  const shimmer = `linear-gradient(100deg, transparent 30%, ${shimmerColor} 50%, transparent 70%)`;

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: entrance.opacity, transform: entrance.transform }}>
        <Surface variant="glass" width={width} height={height} padding={32}>
          {/* The travelling sheen — clipped by Surface's overflow:hidden. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: shimmer,
              backgroundSize: '250% 100%',
              backgroundPositionX: `${posX}%`,
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap }}>
            {thumbnail && (
              <div
                style={{
                  width: '100%',
                  height: barHeight * 6,
                  borderRadius: 12,
                  background: barColor,
                  marginBottom: gap,
                }}
              />
            )}

            {Array.from({ length: lines }, (_, i) => (
              <div
                key={i}
                style={{
                  width: barWidth(i),
                  height: barHeight,
                  borderRadius: barHeight / 2,
                  background: barColor,
                }}
              />
            ))}
          </div>
        </Surface>
      </div>
    </PlacementBox>
  );
};

export default SkeletonCard;
