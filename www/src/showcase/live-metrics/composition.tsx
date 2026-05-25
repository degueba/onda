'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { PulsingIndicator, pulsingIndicatorSchema } from '@onda/registry/components/pulsing-indicator/PulsingIndicator';
import { StatCard, statCardSchema } from '@onda/registry/components/stat-card/StatCard';
import { LineChart, lineChartSchema } from '@onda/registry/components/line-chart/LineChart';
import { BarChart, barChartSchema } from '@onda/registry/components/bar-chart/BarChart';
import { WordStagger, wordStaggerSchema } from '@onda/registry/components/word-stagger/WordStagger';
import { DynamicGrid, dynamicGridSchema } from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const LiveMetricsComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <DynamicGrid {...dynamicGridSchema.parse({ variant: 'lines', opacity: 0.5, speed: 0.3, glow: true })} />

      <TransitionSeries>
        {/* Beat 1 — live header */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill>
            <TitleCard
              {...titleCardSchema.parse({
                title: 'Live metrics',
                subtitle: 'REAL-TIME',
                titleSize: 'hero',
                subtitleSize: 'caption',
                placement: 'center',
              })}
            />
            <PulsingIndicator {...pulsingIndicatorSchema.parse({ label: 'LIVE', placement: 'upper-third' })} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 — hero number */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <StatCard
            {...statCardSchema.parse({ value: 2.4, suffix: 'M', label: 'REQUESTS / DAY', placement: 'center' })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 — trend */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <AbsoluteFill>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'REQUESTS OVER TIME',
                size: 'caption',
                justify: 'center',
                color: '#56565F',
                placement: 'upper-third',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <LineChart
              {...lineChartSchema.parse({ data: [12, 18, 15, 24, 22, 31, 28, 38], width: 1100, height: 420, placement: 'center' })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 4 — breakdown */}
        <TransitionSeries.Sequence durationInFrames={85}>
          <BarChart
            {...barChartSchema.parse({
              data: [
                { label: 'API', value: 620 },
                { label: 'Web', value: 480 },
                { label: 'Jobs', value: 300 },
              ],
              max: 700,
              barHeight: 44,
              gap: 20,
              labelWidth: 120,
              fontSize: 30,
              duration: 36,
              stagger: 8,
              delay: 16,
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
