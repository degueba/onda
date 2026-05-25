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
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';

const AUDIO_SRC = '/music.mp3';

export const MusicReleaseComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E12',
          angle: 135,
          speed: 0.2,
        })}
      />

      <AudioClip {...audioClipSchema.parse({ src: AUDIO_SRC, volume: 0.6 })} />

      {/* Artist + track stacked in the upper third. Items omit `placement`
          so the flex column does the stacking instead of each one parking
          at canvas center on its own layer. */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          flexDirection: 'column',
          paddingTop: 220,
          gap: 18,
        }}
      >
        <BlurReveal
          {...blurRevealSchema.parse({
            text: 'LYRA',
            size: 'hero',
            duration: 28,
          })}
        />
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'midnight tide',
            size: 'subheading',
            stagger: 5,
            justify: 'center',
            color: '#8E8E98',
            delay: 30,
          })}
        />
      </AbsoluteFill>

      {/* Visualizer — the "player UI" signature. Lives mid-canvas so it
          reads as the equalizer panel of a music player. */}
      <Sequence from={0} durationInFrames={360}>
        <AudioVisualizer
          {...audioVisualizerSchema.parse({
            src: AUDIO_SRC,
            ...audioVisualizerPresets.soundcloud,
            width: 880,
            height: 160,
            placement: 'center',
          })}
        />
      </Sequence>

      {/* Release tagline — lands at 5s, sits in the lower third. */}
      <Sequence from={150}>
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'OUT NOW · 5·24·26',
            size: 'caption',
            stagger: 4,
            justify: 'center',
            color: '#D96B82',
            placement: 'lower-third',
            fontFamily: '"Space Grotesk", ui-monospace, monospace',
          })}
        />
      </Sequence>

      <Vignette {...vignetteSchema.parse({ intensity: 0.65 })} />
    </AbsoluteFill>
  );
};
