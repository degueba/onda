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
  Highlight,
  highlightSchema,
} from '@onda/registry/components/highlight/Highlight';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';
import { zoom } from '@onda/registry/transitions/zoom/zoom';

const houseTiming = linearTiming({
  durationInFrames: 12, // tighter than 18 — social pace is fast
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const SocialAdVerticalComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E12',
          angle: 135,
          speed: 0.4,
        })}
      />

      <TransitionSeries>
        {/* Hook (0–2.5s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <BlurReveal
            {...blurRevealSchema.parse({
              text: 'still hand-coding motion?',
              size: 'heading',
              duration: 18,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 1 (2.5–5s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <Highlight
            {...highlightSchema.parse({
              text: 'one install',
              size: 'hero',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 (5–7.5s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <Highlight
            {...highlightSchema.parse({
              text: 'one motion language',
              size: 'hero',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 (7.5–10s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <WordStagger
            {...wordStaggerSchema.parse({
              text: 'source you own',
              size: 'hero',
              stagger: 4,
              justify: 'center',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={zoom({ direction: 'in', scaleAmount: 0.15 })} timing={houseTiming} />

        {/* Stat punch (10–12.5s) — stacked, so children omit `placement`
            and let the flex column center them. */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
            <CountUp
              {...countUpSchema.parse({
                from: 0,
                to: 54,
                size: 'hero',
                duration: 60,
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'components, transitions, lib',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* CTA (12.5–15s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <EndCard
            {...endCardSchema.parse({
              cta: 'onda.video',
              handles: ['npx ondajs add blur-reveal'],
              accent: true,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.7 })} />
    </AbsoluteFill>
  );
};
