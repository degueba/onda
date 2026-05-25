'use client';

import React from 'react';
import { AbsoluteFill, Easing, Sequence } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  AudioClip,
  audioClipSchema,
} from '@onda/registry/components/audio-clip/AudioClip';
import {
  AudioVisualizer,
  audioVisualizerSchema,
  audioVisualizerPresets,
} from '@onda/registry/components/audio-visualizer/AudioVisualizer';
import {
  BlurReveal,
  blurRevealSchema,
} from '@onda/registry/components/blur-reveal/BlurReveal';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { morph } from '@onda/registry/transitions/morph/morph';

const AUDIO_SRC = '/ambient.mp3';

// Slower transitions for the meditative pace — calm reads as long
// crossfades, never punchy cuts.
const calmTiming = linearTiming({
  durationInFrames: 36,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// One box-breath cycle. Durations in frames at 30fps.
const INHALE = 120; // 4s
const HOLD = 120; // 4s
const EXHALE = 180; // 6s
const SETTLE = 180; // 6s

export const MeditationBreathComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E18',
          angle: 180,
          speed: 0.12,
        })}
      />

      {/* Soft ambient audio — quiet so it doesn't compete with the cue. */}
      <AudioClip {...audioClipSchema.parse({ src: AUDIO_SRC, volume: 0.35 })} />

      {/* Aurora hills carry the bottom half — rising and falling fills
          subtly mirror the breath itself. */}
      <Sequence from={0} durationInFrames={600}>
        <AudioVisualizer
          {...audioVisualizerSchema.parse({
            src: AUDIO_SRC,
            ...audioVisualizerPresets.aurora,
            width: 1080,
            height: 720,
            placement: 'bottom',
          })}
        />
      </Sequence>

      {/* Cue copy — one verb per breath phase, morphed between. */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INHALE}>
          <BreathCue verb="inhale" seconds={4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={calmTiming} />

        <TransitionSeries.Sequence durationInFrames={HOLD}>
          <BreathCue verb="hold" seconds={4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={calmTiming} />

        <TransitionSeries.Sequence durationInFrames={EXHALE}>
          <BreathCue verb="exhale" seconds={6} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={calmTiming} />

        <TransitionSeries.Sequence durationInFrames={SETTLE}>
          <BreathCue verb="settle" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};

// Each cue: a single verb (BlurReveal, hero size) with an optional
// duration line under it. Stacked in a flex column so neither overlaps
// the other.
const BreathCue: React.FC<{ verb: string; seconds?: number }> = ({
  verb,
  seconds,
}) => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      flexDirection: 'column',
      paddingTop: 480,
      gap: 16,
    }}
  >
    <BlurReveal
      {...blurRevealSchema.parse({
        text: verb,
        size: 'hero',
        duration: 28,
      })}
    />
    {seconds !== undefined && (
      <WordStagger
        {...wordStaggerSchema.parse({
          text: `${seconds} seconds`,
          size: 'caption',
          stagger: 4,
          justify: 'center',
          color: '#8E8E98',
          delay: 28,
          fontFamily: '"Space Grotesk", ui-monospace, monospace',
        })}
      />
    )}
  </AbsoluteFill>
);
