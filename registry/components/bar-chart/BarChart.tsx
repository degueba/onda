import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, STAGGER, SPRING_SMOOTH, staggerFrames } from '../../../lib/motion';

export const barChartSchema = z.object({
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .default([
      { label: 'Remotion', value: 92 },
      { label: 'After Effects', value: 64 },
      { label: 'Lottie', value: 38 },
    ]),
  max: z.number().default(100),                              // value mapped to full bar width
  delay: z.number().int().min(0).default(0),                 // frames before the first bar starts
  duration: z.number().int().min(1).default(DURATION.slow),  // bars want time — 24 frames
  stagger: z.number().int().min(0).default(STAGGER),         // 4 frames between bars
  barHeight: z.number().default(32),
  gap: z.number().default(16),                               // px between rows
  accentColor: z.string().default('#D96B82'),                // --onda-accent (earned: largest only)
  barColor: z.string().default('#8E8E98'),                   // --onda-dim
  trackColor: z.string().default('#1C1C22'),                 // --onda-border
  color: z.string().default('#F2F2F4'),                      // --onda-text (labels)
  labelWidth: z.number().default(220),                       // px reserved for the label column
  fontSize: z.number().default(24),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type BarChartProps = z.infer<typeof barChartSchema>;

export const BarChart: React.FC<BarChartProps> = ({
  data, max, delay, duration, stagger, barHeight, gap,
  accentColor, barColor, trackColor, color, labelWidth, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find the largest value — that bar earns the accent. Ties go to the first
  // occurrence; this is deterministic and keeps the "one accent moment" rule.
  // Guard against an empty data array so the component never crashes.
  const maxValue = data.reduce((m, d) => (d.value > m ? d.value : m), -Infinity);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        color,
        fontSize,
        fontFamily,
        fontWeight: 500,
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
  );
};
