'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { Terminal, terminalSchema } from '@onda/registry/components/terminal/Terminal';
import { BrowserFrame, browserFrameSchema } from '@onda/registry/components/browser-frame/BrowserFrame';
import { DynamicGrid, dynamicGridSchema } from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { expandMorph } from '@onda/registry/transitions/expand-morph/expandMorph';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// 1280×720 ship moment. A terminal types the deploy command and prints the
// success log with the live URL, then an expand-morph grows that surface into
// the browser frame showing the deployed site — the command literally becomes
// the result. One focal surface per beat.
export const DeployRevealComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <DynamicGrid
        {...dynamicGridSchema.parse({ variant: 'dots', opacity: 0.3, speed: 0.25, glow: false })}
      />

      <TransitionSeries>
        {/* Beat 1 — deploy in the terminal */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Terminal
            {...terminalSchema.parse({
              command: 'ondajs deploy --prod',
              output: [
                '✓ build complete (4.2s)',
                '✓ uploaded 24 assets',
                '✓ live at https://onda.video',
              ],
              title: 'zsh',
              outputDelay: 10,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={expandMorph()} timing={houseTiming} />

        {/* Beat 2 — the deployed site */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <BrowserFrame
            {...browserFrameSchema.parse({
              url: 'onda.video',
              width: 1100,
              height: 560,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
