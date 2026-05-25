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
  StatCard,
  statCardSchema,
} from '@onda/registry/components/stat-card/StatCard';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  GrainOverlay,
  grainOverlaySchema,
} from '@onda/registry/components/grain-overlay/GrainOverlay';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';
import { morph } from '@onda/registry/transitions/morph/morph';
import { depthPush } from '@onda/registry/transitions/depth-push/depthPush';

// House timing — same easing every Onda primitive uses, 18-frame
// duration matches DURATION.base from lib/motion.ts. Pinned here so
// every transition in this showcase inherits the same rhythm.
const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const ExplainerComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E12',
          angle: 135,
          speed: 0.25,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 — Title (0–4s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Onda',
              subtitle: 'motion graphics for Remotion',
              titleSize: 'hero',
              subtitleSize: 'subheading',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 — Feature one (4–10s). Items in this flex column omit
            `placement` so the wrapper centers them instead of each one
            parking at canvas center on its own layer (which would overlap). */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
            <Highlight
              {...highlightSchema.parse({
                text: 'composable',
                size: 'hero',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: '42 components · 12 transitions · one motion language',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 3 — Feature two (10–16s) */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'agent-friendly contract',
                size: 'hero',
                stagger: 4,
                justify: 'center',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'Zod schemas drive structured output for any LLM',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
                delay: 20,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 4 — Feature three (16–22s) */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'source you own',
                size: 'hero',
                stagger: 4,
                justify: 'center',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'npx ondajs add cross-fade · zero black-box magic',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
                delay: 20,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={depthPush({ direction: 'left' })} timing={houseTiming} />

        {/* Beat 5 — Stat punctuation (22–26s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <StatCard
              {...statCardSchema.parse({
                value: 54,
                label: 'installable units across components, transitions, and lib',
                accent: true,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 6 — CTA close (26–30s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <EndCard
            {...endCardSchema.parse({
              cta: 'Made with Onda',
              handles: ['onda.video'],
              accent: true,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <GrainOverlay
        {...grainOverlaySchema.parse({
          opacity: 0.05,
          baseFrequency: 0.9,
          numOctaves: 1,
        })}
      />
      <Vignette {...vignetteSchema.parse({ intensity: 0.7 })} />
    </AbsoluteFill>
  );
};
