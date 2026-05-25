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
  Underline,
  underlineSchema,
} from '@onda/registry/components/underline/Underline';
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
import { morph } from '@onda/registry/transitions/morph/morph';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const SaveTheDateComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E14',
          angle: 135,
          speed: 0.18,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 (0–2s) — eyebrow lands */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <WordStagger
            {...wordStaggerSchema.parse({
              text: 'SAVE THE DATE',
              size: 'subheading',
              stagger: 4,
              justify: 'center',
              color: '#56565F',
              placement: 'center',
              fontFamily: '"Space Grotesk", ui-monospace, monospace',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 2 (2–5s) — hero date typography */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'MAY',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#8E8E98',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            <BlurReveal
              {...blurRevealSchema.parse({
                text: '24',
                size: 'hero',
                duration: 28,
                fontSize: 320,
                delay: 12,
              })}
            />
            <Underline
              {...underlineSchema.parse({
                text: '2026',
                size: 'heading',
                delay: 36,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={houseTiming} />

        {/* Beat 3 (5–8s) — event details */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <BlurReveal
              {...blurRevealSchema.parse({
                text: 'Onda Summit',
                size: 'hero',
                duration: 28,
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'San Francisco · onda.video/summit',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#D96B82',
                delay: 32,
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <GrainOverlay
        {...grainOverlaySchema.parse({
          opacity: 0.04,
          baseFrequency: 0.9,
          numOctaves: 1,
        })}
      />
      <Vignette {...vignetteSchema.parse({ intensity: 0.65 })} />
    </AbsoluteFill>
  );
};
