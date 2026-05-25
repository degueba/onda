import React from 'react';
import { interpolate } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { useSceneProgress } from '../../../lib/hooks';
import { lineChartSchema, type LineChartProps } from './schema';

export { lineChartSchema, type LineChartProps };

/**
 * A line chart whose path draws on left-to-right on the house easing, with an
 * optional soft area fill and per-point dots that pop as the line reaches
 * them. Deterministic — the draw uses SVG `pathLength` normalization keyed off
 * the frame, no DOM measurement.
 *
 * @example
 * <LineChart data={[12, 18, 15, 24, 31]} />
 */
export const LineChart: React.FC<LineChartProps> = ({
  data, delay, duration, color, strokeWidth, width, height, fill, showDots, placement,
}) => {
  const progress = useSceneProgress({ delay, durationInFrames: duration, eased: true });

  const n = data.length;
  const padX = 24;
  const padTop = 24;
  const padBottom = 32;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const xAt = (i: number) => padX + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => padTop + (max === min ? innerH / 2 : (1 - (v - min) / (max - min)) * innerH);

  const pts = data.map((v, i) => [xAt(i), yAt(v)] as const);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
  const baseline = padTop + innerH;
  const areaPath = `${linePath} L${xAt(n - 1)} ${baseline} L${xAt(0)} ${baseline} Z`;
  const gradId = 'onda-linechart-fill';

  return (
    <PlacementBox placement={placement}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {fill && (
          <path d={areaPath} fill={`url(#${gradId})`} opacity={interpolate(progress, [0, 1], [0, 1])} />
        )}

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />

        {showDots &&
          pts.map((p, i) => {
            const threshold = n <= 1 ? 0 : i / (n - 1);
            const dotOpacity = interpolate(progress, [threshold - 0.02, threshold + 0.02], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return <circle key={i} cx={p[0]} cy={p[1]} r={strokeWidth + 2} fill={color} opacity={dotOpacity} />;
          })}
      </svg>
    </PlacementBox>
  );
};
