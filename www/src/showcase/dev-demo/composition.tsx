'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { Terminal, terminalSchema } from '@onda/registry/components/terminal/Terminal';
import { CodeBlock, codeBlockSchema } from '@onda/registry/components/code-block/CodeBlock';
import { BrowserFrame, browserFrameSchema } from '@onda/registry/components/browser-frame/BrowserFrame';
import { Cursor, cursorSchema } from '@onda/registry/components/cursor/Cursor';
import { DynamicGrid, dynamicGridSchema } from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { glassWipe } from '@onda/registry/transitions/glass-wipe/glassWipe';
import { zoom } from '@onda/registry/transitions/zoom/zoom';
import { gridPixelate } from '@onda/registry/transitions/grid-pixelate/gridPixelate';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// One focal surface per beat: title → install → code → result. The dev
// story reads as a directed sequence, not a wall of windows.
export const DevDemoComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <DynamicGrid
        {...dynamicGridSchema.parse({ variant: 'dots', opacity: 0.35, speed: 0.25, glow: false })}
      />

      <TransitionSeries>
        {/* Beat 1 — title */}
        <TransitionSeries.Sequence durationInFrames={70}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Build in code',
              subtitle: 'ONDA FOR DEVELOPERS',
              titleSize: 'hero',
              subtitleSize: 'caption',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={glassWipe()} timing={houseTiming} />

        {/* Beat 2 — install */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <Terminal
            {...terminalSchema.parse({
              command: 'npx ondajs add code-block',
              output: ['✓ added code-block', '✓ wrote 4 files'],
              title: 'zsh',
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={zoom()} timing={houseTiming} />

        {/* Beat 3 — code */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <CodeBlock
            {...codeBlockSchema.parse({
              title: 'Hero.tsx',
              code: "import { BlurReveal } from './onda/blur-reveal';\n\nexport const Hero = () => (\n  <BlurReveal text=\"Onda\" />\n);",
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={gridPixelate()} timing={houseTiming} />

        {/* Beat 4 — result + cursor click */}
        <TransitionSeries.Sequence durationInFrames={95}>
          <AbsoluteFill>
            <BrowserFrame
              {...browserFrameSchema.parse({ url: 'onda.video', width: 1200, height: 600, placement: 'center' })}
            />
            <Cursor
              {...cursorSchema.parse({ fromX: 0.3, fromY: 0.82, toX: 0.5, toY: 0.46, delay: 10, clickDelay: 8 })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
