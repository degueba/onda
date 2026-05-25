'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
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
import { zoom } from '@onda/registry/transitions/zoom/zoom';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// Two beats: countdown ticking down, then the brand reveal. The `zoom`
// transition from beat 1 → 2 is the one punctuation moment — the rest
// of the showcase stays calm so the "0" landing earns the punch.

export const LaunchCountdownComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E18',
          angle: 180,
          speed: 0.18,
        })}
      />

      <TransitionSeries>
        {/* Beat 1 (0–5s) — countdown */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'LAUNCHING IN',
                size: 'subheading',
                stagger: 4,
                justify: 'center',
                color: '#56565F',
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
            {/* CountUp from 5 → 0 with integer decimals — the rounded
                value visually ticks down 5, 4, 3, 2, 1, 0. */}
            <CountUp
              {...countUpSchema.parse({
                from: 5,
                to: 0,
                decimals: 0,
                fontSize: 360,
                duration: 130,
                delay: 18,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zoom({ direction: 'in', scaleAmount: 0.2 })}
          timing={houseTiming}
        />

        {/* Beat 2 (5–10s) — brand reveal */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 28,
            }}
          >
            <BlurReveal
              {...blurRevealSchema.parse({
                text: 'Onda 2.0',
                size: 'hero',
                duration: 30,
              })}
            />
            <Highlight
              {...highlightSchema.parse({
                text: 'May 24 · 2026',
                size: 'subheading',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'available now · onda.video',
                size: 'caption',
                stagger: 4,
                justify: 'center',
                color: '#D96B82',
                delay: 60,
                fontFamily: '"Space Grotesk", ui-monospace, monospace',
              })}
            />
          </AbsoluteFill>
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
