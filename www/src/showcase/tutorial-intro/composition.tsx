'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  Highlight,
  highlightSchema,
} from '@onda/registry/components/highlight/Highlight';
import {
  ProgressBar,
  progressBarSchema,
} from '@onda/registry/components/progress-bar/ProgressBar';
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

// Three beats: lesson context + title → three takeaways → next CTA.
// Calm and informational throughout — tutorials don't want the marketing
// energy of a product reel.

export const TutorialIntroComposition: React.FC = () => {
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
        {/* Beat 1 (0–3s) — course context + lesson title */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Springs vs. easing',
              subtitle: 'ONDA MOTION COURSE · LESSON 03 / 08',
              titleSize: 'hero',
              subtitleSize: 'caption',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 (3–9s) — three takeaways, staggered in. */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <AbsoluteFill
            style={{
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 28,
              paddingLeft: 240,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'WHAT YOU’LL LEARN',
                size: 'caption',
                stagger: 4,
                justify: 'flex-start',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '01  Spring physics: motion that settles',
                size: 'subheading',
                stagger: 4,
                justify: 'flex-start',
                color: '#F2F2F4',
                delay: 18,
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '02  Easing curves: a pre-defined shape',
                size: 'subheading',
                stagger: 4,
                justify: 'flex-start',
                color: '#F2F2F4',
                delay: 48,
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '03  When Onda picks one over the other',
                size: 'subheading',
                stagger: 4,
                justify: 'flex-start',
                color: '#F2F2F4',
                delay: 78,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 (9–12s) — next-lesson CTA + course progress */}
        <TransitionSeries.Sequence durationInFrames={90}>
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
                text: 'NEXT LESSON',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <Highlight
              {...highlightSchema.parse({
                text: 'Custom easing curves',
                size: 'heading',
              })}
            />
            <div style={{ width: 640, marginTop: 24 }}>
              <ProgressBar
                {...progressBarSchema.parse({
                  value: 38,
                  height: 6,
                  showValue: false,
                  duration: 30,
                  delay: 18,
                })}
              />
            </div>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '03 / 08 COMPLETE',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
                delay: 48,
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
