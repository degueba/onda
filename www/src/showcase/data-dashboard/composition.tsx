'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
import {
  BarChart,
  barChartSchema,
} from '@onda/registry/components/bar-chart/BarChart';
import {
  ProgressBar,
  progressBarSchema,
} from '@onda/registry/components/progress-bar/ProgressBar';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// One focal data point per beat — the report reads as a deliberate
// progression (title → headline → breakdown → goal) instead of a wall
// of competing charts. Numbers tie together: the four quarterly bars
// sum to ~$2.48M, the hero figure, which is 92% of the $2.7M target.

export const DataDashboardComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#10131A',
          angle: 135,
          speed: 0.15,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 (0–2s) — title lands */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Q4 2026',
              subtitle: 'PERFORMANCE REPORT',
              titleSize: 'hero',
              subtitleSize: 'caption',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 (2–5s) — headline revenue */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <CountUp
              {...countUpSchema.parse({
                from: 0,
                to: 2.48,
                decimals: 2,
                prefix: '$',
                suffix: 'M',
                fontSize: 160,
                duration: 60,
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '▲ 38% year over year',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#D96B82',
                delay: 60,
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 (5–8.5s) — quarterly breakdown */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'QUARTERLY REVENUE',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <BarChart
              {...barChartSchema.parse({
                data: [
                  { label: 'Q1', value: 480 },
                  { label: 'Q2', value: 580 },
                  { label: 'Q3', value: 660 },
                  { label: 'Q4', value: 760 },
                ],
                max: 800,
                barHeight: 40,
                gap: 18,
                labelWidth: 100,
                fontSize: 28,
                duration: 36,
                stagger: 8,
                delay: 20,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 4 (8.5–12s) — goal hit */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'YEARLY TARGET',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <div style={{ width: 760 }}>
              <ProgressBar
                {...progressBarSchema.parse({
                  value: 92,
                  height: 14,
                  showValue: false,
                  duration: 48,
                  delay: 20,
                })}
              />
            </div>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '92% · $2.48M of $2.70M',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#F2F2F4',
                delay: 68,
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.55 })} />
    </AbsoluteFill>
  );
};
