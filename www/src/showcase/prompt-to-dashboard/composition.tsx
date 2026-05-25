'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  DynamicGrid,
  dynamicGridSchema,
} from '@onda/registry/components/dynamic-grid/DynamicGrid';
import {
  InputField,
  inputFieldSchema,
} from '@onda/registry/components/input-field/InputField';
import {
  SkeletonCard,
  skeletonCardSchema,
} from '@onda/registry/components/skeleton-card/SkeletonCard';
import {
  BentoGrid,
  bentoGridSchema,
} from '@onda/registry/components/bento-grid/BentoGrid';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
import {
  BarChart,
  barChartSchema,
} from '@onda/registry/components/bar-chart/BarChart';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { flip } from '@onda/registry/transitions/flip/flip';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// An AI-generation beat: a prompt types itself in, placeholders appear
// while the model "thinks", then a 3D flip reveals the finished dashboard.
export const PromptToDashboardComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <DynamicGrid
        {...dynamicGridSchema.parse({
          variant: 'dots',
          opacity: 0.35,
          speed: 0.2,
          glow: false,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 (0–~2.5s) — the prompt types itself in */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <InputField
            {...inputFieldSchema.parse({
              value: 'Build me a sales dashboard',
              label: 'PROMPT',
              placeholder: 'Describe what to build…',
              typed: true,
              typeDuration: 40,
              delay: 10,
              width: 760,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={flip({ direction: 'up' })}
          timing={houseTiming}
        />

        {/* Beat 2 (~2.5–4.5s) — generating: placeholders shimmer in */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill>
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 1,
                thumbnail: false,
                width: 360,
                height: 130,
                placement: { x: 0.3, y: 0.34, anchor: 'center' },
              })}
            />
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 1,
                thumbnail: false,
                width: 360,
                height: 130,
                delay: 5,
                placement: { x: 0.7, y: 0.34, anchor: 'center' },
              })}
            />
            <SkeletonCard
              {...skeletonCardSchema.parse({
                lines: 4,
                thumbnail: false,
                width: 760,
                height: 200,
                delay: 10,
                placement: { x: 0.5, y: 0.7, anchor: 'center' },
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={flip({ direction: 'left' })}
          timing={houseTiming}
        />

        {/* Beat 3 (~4.5–8s) — the finished dashboard flips into view */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <AbsoluteFill>
            <BentoGrid
              {...bentoGridSchema.parse({
                items: [
                  {
                    title: 'Revenue',
                    value: '$2.48M',
                    caption: '▲ 38% YoY',
                    colSpan: 2,
                    rowSpan: 1,
                    accent: true,
                  },
                  {
                    title: 'New customers',
                    value: '1,204',
                    caption: 'this quarter',
                    colSpan: 1,
                    rowSpan: 1,
                    accent: false,
                  },
                  {
                    title: 'Retention',
                    value: '94%',
                    caption: 'rolling 90-day',
                    colSpan: 1,
                    rowSpan: 1,
                    accent: false,
                  },
                  {
                    title: 'Quarterly trend',
                    caption: 'steady climb across the year',
                    colSpan: 2,
                    rowSpan: 1,
                    accent: false,
                  },
                ],
                columns: 3,
                width: 980,
                stagger: 4,
                delay: 6,
                placement: { x: 0.5, y: 0.34, anchor: 'center' },
              })}
            />
            <CountUp
              {...countUpSchema.parse({
                from: 0,
                to: 2.48,
                decimals: 2,
                prefix: '$',
                suffix: 'M',
                fontSize: 64,
                duration: 46,
                delay: 30,
                placement: { x: 0.27, y: 0.74, anchor: 'center' },
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
                barHeight: 22,
                gap: 10,
                labelWidth: 64,
                fontSize: 18,
                duration: 32,
                stagger: 6,
                delay: 40,
                placement: { x: 0.68, y: 0.74, anchor: 'center' },
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
