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
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';

const AUDIO_SRC = '/dance.mp3';

export const LiveStreamOverlayComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Subtle bg — in real use this would be transparent and sit over
          the streamer's camera feed. The dim gradient stands in for
          "video feed area" so the overlay reads on its own. */}
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#0A0A0E',
          to: '#15151B',
          angle: 135,
          speed: 0.15,
        })}
      />

      <AudioClip {...audioClipSchema.parse({ src: AUDIO_SRC, volume: 0.5 })} />

      {/* Bottom-anchored equalizer — the only thing that animates after
          the opening 1-2s, so the loop reads as continuous. */}
      <Sequence from={0} durationInFrames={300}>
        <AudioVisualizer
          {...audioVisualizerSchema.parse({
            src: AUDIO_SRC,
            ...audioVisualizerPresets.equalizer,
            width: 1920,
            height: 180,
            placement: 'bottom',
          })}
        />
      </Sequence>

      {/* LIVE pill — upper-left, brief stagger in then static. */}
      <WordStagger
        {...wordStaggerSchema.parse({
          text: '● LIVE',
          size: 'caption',
          stagger: 3,
          justify: 'flex-start',
          color: '#D96B82',
          placement: { x: 0.04, y: 0.08, anchor: 'top-left' },
          fontFamily: '"Space Grotesk", ui-monospace, monospace',
        })}
      />

      {/* Watcher count — upper-right. */}
      <WordStagger
        {...wordStaggerSchema.parse({
          text: '12,847 watching',
          size: 'caption',
          stagger: 3,
          justify: 'flex-end',
          color: '#8E8E98',
          placement: { x: 0.96, y: 0.08, anchor: 'top-right' },
          fontFamily: '"Space Grotesk", ui-monospace, monospace',
        })}
      />

      {/* Now-playing strip above the equalizer. Eyebrow + track text
          stacked, anchored at the same lower-left corner via flex. */}
      <AbsoluteFill
        style={{
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '0 0 220px 80px',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'NOW PLAYING',
            size: 'caption',
            stagger: 3,
            justify: 'flex-start',
            color: '#56565F',
            fontFamily: '"Space Grotesk", ui-monospace, monospace',
          })}
        />
        <WordStagger
          {...wordStaggerSchema.parse({
            text: 'Onda Mix vol. 02 — DJ Sera',
            size: 'subheading',
            stagger: 4,
            justify: 'flex-start',
            color: '#F2F2F4',
            delay: 12,
          })}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
