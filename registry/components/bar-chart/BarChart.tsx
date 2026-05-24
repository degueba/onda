import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, SPRING_SMOOTH, staggerFrames } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link BarChart} props. */
export const barChartSchema = z.object({
  /** Bars to render. Order is preserved — top to bottom. */
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .default([
      { label: 'Remotion', value: 92 },
      { label: 'After Effects', value: 64 },
      { label: 'Lottie', value: 38 },
    ]),
  /** Value mapped to a full-width bar. Bars cap at 100% of the track. */
  max: z.number().default(100),
  /** Frames before the **first** bar starts. */
  delay: z.number().int().min(0).default(0),
  /** Per-bar grow duration. Bars want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Frames between consecutive bars. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /** Bar height in px. */
  barHeight: z.number().default(32),
  /** Pixel gap between rows. */
  gap: z.number().default(16),
  /** Color of the **largest** bar — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Color of non-largest bars. Defaults to `--onda-dim`. */
  barColor: z.string().default('#8E8E98'),
  /** Bar track color. Defaults to `--onda-border`. */
  trackColor: z.string().default('#1C1C22'),
  /** Label color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Pixels reserved for the label column. */
  labelWidth: z.number().default(220),
  /** Pixels. */
  fontSize: z.number().default(24),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link BarChart}. */
export type BarChartProps = z.infer<typeof barChartSchema>;

/**
 * Horizontal bars that grow from 0 to their value on `SPRING_SMOOTH`,
 * staggered. Single-accent palette: the largest bar earns `--onda-accent`,
 * every other bar sits in `--onda-dim`. Calm, no overshoot, one focal moment.
 *
 * @example
 * <BarChart data={[{ label: 'Remotion', value: 92 }, { label: 'After Effects', value: 64 }]} />
 */
export const BarChart: React.FC<BarChartProps> = ({
  data, max, delay, duration, stagger, barHeight, gap,
  accentColor, barColor, trackColor, color, labelWidth, fontSize, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find the largest value — that bar earns the accent. Ties go to the first
  // occurrence; this is deterministic and keeps the "one accent moment" rule.
  // Guard against an empty data array so the component never crashes.
  const maxValue = data.reduce((m, d) => (d.value > m ? d.value : m), -Infinity);

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          color,
          fontSize,
          fontFamily,
          fontWeight: 500,
          // Without an explicit width the column shrinks to its label content
          // and the `flex: 1` track collapses to zero. 80% of canvas gives the
          // bars somewhere to grow into while leaving generous side margins.
          width: '80%',
          maxWidth: 1400,
        }}
      >
        {data.map((d, i) => {
        const barDelay = delay + staggerFrames(i, stagger);
        const local = Math.max(0, frame - barDelay);

        // Spring drives both the fill width and a calm fade-in. SPRING_SMOOTH
        // settles without overshoot — bars do not bounce past their value.
        const progress = spring({
          frame: local,
          fps,
          config: SPRING_SMOOTH,
          durationInFrames: duration,
        });

        // Target fill % of the track. Clamped at 100 so out-of-range data
        // never overflows the track (callers can raise `max` if needed).
        const targetPct = Math.max(0, Math.min(100, (d.value / max) * 100));

        const fillPct = interpolate(progress, [0, 1], [0, targetPct], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const opacity = interpolate(progress, [0, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const isLargest = d.value === maxValue;
        const fillColor = isLargest ? accentColor : barColor;

        return (
          <div
            key={`${i}-${d.label}`}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 24,
              opacity,
            }}
          >
            <div
              style={{
                width: labelWidth,
                flexShrink: 0,
                textAlign: 'right',
                color,
              }}
            >
              {d.label}
            </div>
            <div
              style={{
                position: 'relative',
                flex: 1,
                height: barHeight,
                background: trackColor,
                borderRadius: barHeight / 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${fillPct}%`,
                  height: '100%',
                  background: fillColor,
                  borderRadius: barHeight / 2,
                }}
              />
            </div>
          </div>
        );
      })}
      </div>
    </PlacementBox>
  );
};
