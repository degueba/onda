'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { TrackingIn, trackingInSchema } from '@onda/registry/components/tracking-in/TrackingIn';
import { MatrixDecode, matrixDecodeSchema } from '@onda/registry/components/matrix-decode/MatrixDecode';
import { RgbGlitchText, rgbGlitchTextSchema } from '@onda/registry/components/rgb-glitch-text/RgbGlitchText';
import { SlotMachineRoll, slotMachineRollSchema } from '@onda/registry/components/slot-machine-roll/SlotMachineRoll';
import { WordRotate, wordRotateSchema } from '@onda/registry/components/word-rotate/WordRotate';
import { TextFadeReplace, textFadeReplaceSchema } from '@onda/registry/components/text-fade-replace/TextFadeReplace';
import { ShimmerSweep, shimmerSweepSchema } from '@onda/registry/components/shimmer-sweep/ShimmerSweep';
import { DynamicGrid, dynamicGridSchema } from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { gridPixelate } from '@onda/registry/transitions/grid-pixelate/gridPixelate';
import { chromaticAberration } from '@onda/registry/transitions/chromatic-aberration/chromaticAberration';

// grid-pixelate is the hero cut — a slightly longer timing lets the cells
// dissolve read clearly; chromatic-aberration is a fast glitch flash for accent.
const pixelTiming = linearTiming({ durationInFrames: 34, easing: Easing.bezier(0.16, 1, 0.3, 1) });
const glitchTiming = linearTiming({ durationInFrames: 12, easing: Easing.bezier(0.16, 1, 0.3, 1) });

// A high-energy vertical type teaser. Bold typographic beats are cut together
// with grid-pixelate as the signature transition (with two chromatic-aberration
// flashes for accent) — the pixelate wipe carries the reel.
export const KineticTypeComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
      <DynamicGrid
        {...dynamicGridSchema.parse({ variant: 'dots', opacity: 0.22, speed: 0.25, glow: false })}
      />

      <TransitionSeries>
        {/* 1 — calm open */}
        <TransitionSeries.Sequence durationInFrames={50}>
          <TrackingIn {...trackingInSchema.parse({ text: 'Onda', fontSize: 200, placement: 'center' })} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={gridPixelate()} timing={pixelTiming} />

        {/* 2 — decode */}
        <TransitionSeries.Sequence durationInFrames={55}>
          <MatrixDecode {...matrixDecodeSchema.parse({ text: 'DECODE', fontSize: 150, placement: 'center' })} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={gridPixelate({ cols: 32, rows: 18, seed: 3 })} timing={pixelTiming} />

        {/* 3 — glitch */}
        <TransitionSeries.Sequence durationInFrames={50}>
          <RgbGlitchText {...rgbGlitchTextSchema.parse({ text: 'GLITCH', fontSize: 160, placement: 'center' })} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={chromaticAberration({ intensity: 16 })} timing={glitchTiming} />

        {/* 4 — the number rolls (bold accent scene so the pixelate cuts in/out
             of it dissolve dark↔color, not dark↔dark) */}
        <TransitionSeries.Sequence durationInFrames={55}>
          <AbsoluteFill style={{ backgroundColor: '#D96B82' }}>
            <SlotMachineRoll {...slotMachineRollSchema.parse({ text: '2026', fontSize: 200, color: '#08080A', placement: 'center' })} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={gridPixelate({ cols: 20, rows: 36, seed: 9 })} timing={pixelTiming} />

        {/* 5 — rotating adjectives */}
        <TransitionSeries.Sequence durationInFrames={66}>
          <WordRotate {...wordRotateSchema.parse({ phrases: ['fast', 'bold', 'restrained'], fontSize: 150, placement: 'center' })} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={chromaticAberration({ intensity: 12 })} timing={glitchTiming} />

        {/* 6 — the loop (lighter accent scene — second bold-color cut) */}
        <TransitionSeries.Sequence durationInFrames={78}>
          <AbsoluteFill style={{ backgroundColor: '#E89AAB' }}>
            <TextFadeReplace {...textFadeReplaceSchema.parse({ phrases: ['ship', 'render', 'repeat'], fontSize: 150, color: '#08080A', placement: 'center' })} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={gridPixelate({ cols: 28, rows: 16, seed: 5 })} timing={pixelTiming} />

        {/* 7 — shimmer sign-off */}
        <TransitionSeries.Sequence durationInFrames={56}>
          <ShimmerSweep {...shimmerSweepSchema.parse({ text: 'Onda', fontSize: 180, align: 'center', placement: 'center' })} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
