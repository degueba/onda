'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  DynamicGrid,
  dynamicGridSchema,
} from '@onda/registry/components/dynamic-grid/DynamicGrid';
import {
  SkeletonCard,
  skeletonCardSchema,
} from '@onda/registry/components/skeleton-card/SkeletonCard';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
import {
  BarChart,
  barChartSchema,
} from '@onda/registry/components/bar-chart/BarChart';
import {
  LineChart,
  lineChartSchema,
} from '@onda/registry/components/line-chart/LineChart';
import {
  PieReveal,
  pieRevealSchema,
} from '@onda/registry/components/pie-reveal/PieReveal';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// A 2×2 dashboard grid laid out in canvas fractions. Both acts share the
// exact same four anchors so the real data lands precisely where its
// skeleton stood — the eye reads "this placeholder became that chart."
const SLOTS = {
  topLeft: { x: 0.27, y: 0.32, anchor: 'center' as const },
  topRight: { x: 0.73, y: 0.32, anchor: 'center' as const },
  bottomLeft: { x: 0.27, y: 0.72, anchor: 'center' as const },
  bottomRight: { x: 0.73, y: 0.72, anchor: 'center' as const },
};

// Two acts: an empty scaffold of skeleton placeholders, then a cross-fade
// into the populated dashboard whose contents stagger in slot by slot.
export const DashboardFillComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <DynamicGrid
        {...dynamicGridSchema.parse({
          variant: 'lines',
          opacity: 0.4,
          speed: 0.15,
          glow: false,
        })}
      />

      <TransitionSeries>
        {/* Act 1 (0–~2.5s) — empty scaffold: four shimmering placeholders */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <AbsoluteFill>
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 1,
                thumbnail: false,
                width: 420,
                height: 150,
                placement: SLOTS.topLeft,
              })}
            />
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 1,
                thumbnail: false,
                width: 420,
                height: 150,
                delay: 4,
                placement: SLOTS.topRight,
              })}
            />
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 4,
                thumbnail: false,
                width: 420,
                height: 220,
                delay: 8,
                placement: SLOTS.bottomLeft,
              })}
            />
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 3,
                thumbnail: true,
                width: 420,
                height: 220,
                delay: 12,
                placement: SLOTS.bottomRight,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={crossFade()}
          timing={houseTiming}
        />

        {/* Act 2 (~2.5–8s) — real data populates the same four slots */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <AbsoluteFill>
            {/* Top-left KPI */}
            <CountUp
              {...countUpSchema.parse({
                from: 0,
                to: 2.48,
                decimals: 2,
                prefix: '$',
                suffix: 'M',
                fontSize: 96,
                duration: 50,
                delay: 6,
                placement: SLOTS.topLeft,
              })}
            />
            {/* Top-right KPI */}
            <CountUp
              {...countUpSchema.parse({
                from: 0,
                to: 38,
                suffix: '%',
                color: '#D96B82',
                fontSize: 96,
                duration: 50,
                delay: 14,
                placement: SLOTS.topRight,
              })}
            />
            {/* Bottom-left bar chart */}
            <BarChart
              {...barChartSchema.parse({
                data: [
                  { label: 'Q1', value: 480 },
                  { label: 'Q2', value: 580 },
                  { label: 'Q3', value: 660 },
                  { label: 'Q4', value: 760 },
                ],
                max: 800,
                barHeight: 26,
                gap: 12,
                labelWidth: 70,
                fontSize: 20,
                duration: 34,
                stagger: 6,
                delay: 24,
                placement: SLOTS.bottomLeft,
              })}
            />
            {/* Bottom-right line chart */}
            <LineChart
              {...lineChartSchema.parse({
                data: [12, 18, 15, 24, 22, 31, 28, 38],
                width: 420,
                height: 200,
                strokeWidth: 3,
                duration: 44,
                delay: 36,
                placement: SLOTS.bottomRight,
              })}
            />
            {/* Center pie — the goal completion, the one focal accent */}
            <PieReveal
              {...pieRevealSchema.parse({
                value: 92,
                radius: 72,
                strokeWidth: 10,
                fontSize: 36,
                duration: 48,
                delay: 50,
                placement: { x: 0.5, y: 0.52, anchor: 'center' },
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
