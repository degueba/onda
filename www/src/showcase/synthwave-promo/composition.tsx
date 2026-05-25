'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
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
  GrainOverlay,
  grainOverlaySchema,
} from '@onda/registry/components/grain-overlay/GrainOverlay';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';

const AUDIO_SRC = '/synthwave.mp3';

export const SynthwavePromoComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Saturated dusk gradient — local override of the brand bg
          because synthwave earns the bolder color register. */}
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#1A0820',
          to: '#3A0E2A',
          angle: 135,
          speed: 0.3,
        })}
      />

      <AudioClip {...audioClipSchema.parse({ src: AUDIO_SRC, volume: 0.6 })} />

      {/* Fullscreen neon ring — visualizer is the hero here. */}
      <Sequence from={0} durationInFrames={300}>
        <AudioVisualizer
          {...audioVisualizerSchema.parse({
            src: AUDIO_SRC,
            ...audioVisualizerPresets.neon,
            width: 980,
            height: 980,
            placement: 'center',
          })}
        />
      </Sequence>

      {/* Volume number drops into the ring's negative space. */}
      <Sequence from={10}>
        <BlurReveal
          {...blurRevealSchema.parse({
            text: 'VOL. 03',
            size: 'hero',
            duration: 26,
            placement: 'center',
          })}
        />
      </Sequence>

      {/* Genre tag — upper-third, small monospace, dim. */}
      <Sequence from={45}>
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'synthwave drift',
            size: 'caption',
            stagger: 4,
            justify: 'center',
            color: '#E89AAB',
            placement: 'upper-third',
            fontFamily: '"Space Grotesk", ui-monospace, monospace',
          })}
        />
      </Sequence>

      {/* CTA — lands at ~3s, accent color. */}
      <Sequence from={90}>
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'stream now · onda.video',
            size: 'subheading',
            stagger: 4,
            justify: 'center',
            color: '#D96B82',
            placement: 'lower-third',
            fontFamily: '"Space Grotesk", ui-monospace, monospace',
          })}
        />
      </Sequence>

      {/* Heavier grain than usual — VHS texture suits the genre. */}
      <GrainOverlay
        {...grainOverlaySchema.parse({
          opacity: 0.08,
          baseFrequency: 0.9,
          numOctaves: 2,
        })}
      />
      <Vignette {...vignetteSchema.parse({ intensity: 0.8 })} />
    </AbsoluteFill>
  );
};
