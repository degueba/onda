'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { Camera, useCameraRig } from '@onda/lib/index';
import { PulsingIndicator, pulsingIndicatorSchema } from '@onda/registry/components/pulsing-indicator/PulsingIndicator';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { CodeBlock, codeBlockSchema } from '@onda/registry/components/code-block/CodeBlock';
import { BentoGrid, bentoGridSchema } from '@onda/registry/components/bento-grid/BentoGrid';
import { Confetti, confettiSchema } from '@onda/registry/components/confetti/Confetti';
import { zoom } from '@onda/registry/transitions/zoom/zoom';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// Beat 3 — the camera fly-over. A faux app shell is laid out in a 2400×1200
// world (code on the left, bento on the right). The rig opens wide and slightly
// off-axis, then pushes in and levels out as the shell "assembles" — one
// continuous move, no cuts inside the beat.
const SHELL_FRAMES = 150;

const AppShellWorld: React.FC = () => {
  const rig = useCameraRig([
    { frame: 0, focusX: 1200, focusY: 620, zoom: 0.62, rotate: -3 },
    { frame: SHELL_FRAMES, focusX: 1200, focusY: 600, zoom: 0.92, rotate: 0 },
  ]);

  return (
    <Camera {...rig} viewportWidth={1280} viewportHeight={720}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 2400, height: 1200 }}>
        {/* Left — the code surface */}
        <div style={{ position: 'absolute', left: 120, top: 300, width: 1020 }}>
          <CodeBlock
            {...codeBlockSchema.parse({
              title: 'app.tsx',
              code:
                "import { Hero } from './onda/hero';\n\nexport const App = () => (\n  <Hero release=\"v2.0\" />\n);",
              fontSize: 38,
              width: 1020,
              lineDelay: 4,
            })}
          />
        </div>

        {/* Right — the feature bento */}
        <div style={{ position: 'absolute', left: 1280, top: 260, width: 1000 }}>
          <BentoGrid
            {...bentoGridSchema.parse({
              columns: 3,
              width: 1000,
              gap: 18,
              fontSize: 28,
              stagger: 4,
              delay: 12,
              items: [
                { title: 'Components', value: '40+', caption: 'Copied into your project.', colSpan: 2, rowSpan: 1, accent: false },
                { title: 'Render', value: '4K', caption: 'Frame-perfect.', colSpan: 1, rowSpan: 1, accent: true },
                { title: 'Motion identity', caption: 'One feel, everywhere.', colSpan: 1, rowSpan: 1, accent: false },
                { title: 'Spring physics', caption: 'Calm by default, no overshoot.', colSpan: 2, rowSpan: 1, accent: false },
              ],
            })}
          />
        </div>
      </div>
    </Camera>
  );
};

// Onda flagship launch trailer — a Product-Hunt-style teaser. A pulsing logo
// moment introduces the product, a zoom punch carries forward into a camera
// fly-over that assembles a faux app shell, then it lands on the version
// headline with a confetti burst. ~9s at 30fps.
export const LaunchTrailerComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
      <TransitionSeries>
        {/* Beat 1 — the pulsing logo moment */}
        <TransitionSeries.Sequence durationInFrames={65}>
          <AbsoluteFill>
            <TitleCard
              {...titleCardSchema.parse({
                title: 'Onda',
                subtitle: 'PREMIUM MOTION GRAPHICS',
                titleSize: 'hero',
                subtitleSize: 'caption',
                placement: 'center',
              })}
            />
            <PulsingIndicator
              {...pulsingIndicatorSchema.parse({
                label: 'LAUNCHING',
                size: 16,
                fontSize: 22,
                placement: 'upper-third',
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        {/* The zoom punch — the lone accent cut */}
        <TransitionSeries.Transition
          presentation={zoom({ direction: 'in', scaleAmount: 0.3 })}
          timing={houseTiming}
        />

        {/* Beat 2 — camera fly-over assembling the app shell */}
        <TransitionSeries.Sequence durationInFrames={SHELL_FRAMES}>
          <AppShellWorld />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zoom({ direction: 'in', scaleAmount: 0.22 })}
          timing={houseTiming}
        />

        {/* Beat 4 — the version headline lands with confetti */}
        <TransitionSeries.Sequence durationInFrames={95}>
          <AbsoluteFill>
            <TitleCard
              {...titleCardSchema.parse({
                title: 'v2.0',
                subtitle: 'OUT NOW',
                titleSize: 'hero',
                subtitleSize: 'caption',
                placement: 'center',
              })}
            />
            <Confetti
              {...confettiSchema.parse({
                delay: 8,
                count: 90,
                originY: 0.4,
                spread: 140,
                duration: 75,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
