'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  BlurReveal,
  blurRevealSchema,
} from '@onda/registry/components/blur-reveal/BlurReveal';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  ProgressBar,
  progressBarSchema,
} from '@onda/registry/components/progress-bar/ProgressBar';
import {
  Highlight,
  highlightSchema,
} from '@onda/registry/components/highlight/Highlight';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { morph } from '@onda/registry/transitions/morph/morph';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const CourseCompleteComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#0E1218',
          angle: 135,
          speed: 0.15,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 (0–3s) — progress fills to 100% then title lands */}
        <TransitionSeries.Sequence durationInFrames={90}>
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
                text: 'ONDA MOTION COURSE',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <div style={{ width: 680 }}>
              <ProgressBar
                {...progressBarSchema.parse({
                  value: 100,
                  height: 8,
                  showValue: false,
                  duration: 48,
                  delay: 14,
                })}
              />
            </div>
            <BlurReveal
              {...blurRevealSchema.parse({
                text: 'Course complete',
                size: 'hero',
                duration: 30,
                delay: 36,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 2 (3–7s) — pride stats */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <Highlight
              {...highlightSchema.parse({
                text: 'You shipped this.',
                size: 'heading',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '08 LESSONS · 03:12 HOURS · 01 CERTIFICATE',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
                delay: 24,
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 3 (7–10s) — share CTA */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'DOWNLOAD CERTIFICATE',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#D96B82',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'or share with #onda',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                delay: 18,
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
