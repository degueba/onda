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
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const AUDIO_SRC = '/voice.mp3';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const PodcastIntroComposition: React.FC = () => {
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

      {/* Audio + visualizer play continuously through the whole intro.
          The visualizer never changes — it's the show's visual signature,
          like a station identifier. */}
      <AudioClip {...audioClipSchema.parse({ src: AUDIO_SRC, volume: 0.6 })} />

      <Sequence from={0} durationInFrames={300}>
        <AudioVisualizer
          {...audioVisualizerSchema.parse({
            src: AUDIO_SRC,
            ...audioVisualizerPresets.voice,
            width: 880,
            height: 140,
            placement: 'bottom',
          })}
        />
      </Sequence>

      <TransitionSeries>
        {/* Beat 1 (0–2.5s) — network eyebrow + show name */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Onda Radio',
              subtitle: 'EP 47',
              titleSize: 'heading',
              subtitleSize: 'caption',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 (2.5–7s) — episode title */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <BlurReveal
            {...blurRevealSchema.parse({
              text: 'how designers think about motion',
              size: 'heading',
              duration: 30,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 (7–10s) — host credit */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <WordStagger
            {...wordStaggerSchema.parse({
              text: 'with Sarah Chen',
              size: 'subheading',
              stagger: 5,
              justify: 'center',
              color: '#E89AAB',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.6 })} />
    </AbsoluteFill>
  );
};
