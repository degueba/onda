'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { SplitScreen, splitScreenSchema } from '@onda/registry/components/split-screen/SplitScreen';
import { CodeBlock, codeBlockSchema } from '@onda/registry/components/code-block/CodeBlock';
import { BrowserFrame, browserFrameSchema } from '@onda/registry/components/browser-frame/BrowserFrame';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';

const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);

const SOURCE = `export const Hero = () => (
  <section className="hero">
    <h1>Ship motion in code</h1>
    <button>Get started</button>
  </section>
);`;

// The right pane: a rendered preview that "hot-reloads" as the code lines land.
// Each piece fades in at the frame its corresponding source line is revealed —
// the code-block reveals one line every ~6 frames after its delay, so the
// preview mirrors that cadence. Pure function of frame (CLAUDE.md §1).
const Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (start: number) =>
    interpolate(frame, [start, start + 12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: HOUSE_EASE,
    });

  // A subtle "reload" pulse each time the preview gains a piece.
  const headingShown = at(64);
  const buttonShown = at(82);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 32,
        padding: '0 64px',
        fontFamily: '"Clash Display", sans-serif',
      }}
    >
      <div
        style={{
          opacity: headingShown,
          transform: `translateY(${interpolate(headingShown, [0, 1], [12, 0])}px)`,
          color: '#F2F2F4',
          fontSize: 56,
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}
      >
        Ship motion in code
      </div>
      <div
        style={{
          opacity: buttonShown,
          transform: `translateY(${interpolate(buttonShown, [0, 1], [12, 0])}px)`,
          background: '#D96B82',
          color: '#08080A',
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.01em',
          padding: '16px 32px',
          borderRadius: 12,
        }}
      >
        Get started
      </div>
    </div>
  );
};

// Code reveals line-by-line on the left while the right pane reads as a live
// preview updating in step — the hot-reload loop, side by side.
export const CodeToPreviewComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#08080A' }}>
      <SplitScreen
        {...splitScreenSchema.parse({
          ratio: 0.5,
          gap: 0,
          divider: true,
          width: 1280,
          height: 720,
          placement: 'center',
        })}
        left={
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', padding: 48 }}>
            <CodeBlock
              {...codeBlockSchema.parse({
                title: 'Hero.tsx',
                code: SOURCE,
                fontSize: 21,
                width: 500,
                revealLines: true,
                delay: 24,
                lineDelay: 6,
              })}
            />
          </div>
        }
        right={
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', padding: 48 }}>
            <BrowserFrame
              {...browserFrameSchema.parse({
                url: 'localhost:3000',
                width: 560,
                height: 360,
                delay: 12,
              })}
            >
              <Preview />
            </BrowserFrame>
          </div>
        }
      />

      <Vignette {...vignetteSchema.parse({ intensity: 0.45 })} />
    </AbsoluteFill>
  );
};
