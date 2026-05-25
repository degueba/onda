'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { PulsingIndicator, pulsingIndicatorSchema } from '@onda/registry/components/pulsing-indicator/PulsingIndicator';
import { WordStagger, wordStaggerSchema } from '@onda/registry/components/word-stagger/WordStagger';
import { CodeDiff, codeDiffSchema } from '@onda/registry/components/code-diff/CodeDiff';
import { MeshGradient, meshGradientSchema } from '@onda/registry/components/mesh-gradient/MeshGradient';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { glassWipe } from '@onda/registry/transitions/glass-wipe/glassWipe';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// 1080×1080 release-note micro-video. Beat 1 stamps a "New" badge with a
// caption; a glass-wipe carries us onto the glass card where the diff
// reveals the change line-by-line. Calm, social-ready, one focal beat each.
export const ChangelogLoopComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <MeshGradient {...meshGradientSchema.parse({ opacity: 0.28, speed: 0.6 })} />

      <TransitionSeries>
        {/* Beat 1 — "New" badge + caption */}
        <TransitionSeries.Sequence durationInFrames={66}>
          <AbsoluteFill>
            <PulsingIndicator
              {...pulsingIndicatorSchema.parse({
                label: 'NEW',
                labelColor: '#F2F2F4',
                fontSize: 34,
                placement: { x: 0.5, y: 0.4, anchor: 'center' },
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: "What's new in v1.4",
                size: 'subheading',
                justify: 'center',
                stagger: 4,
                color: '#8E8E98',
                fontFamily: '"Space Grotesk", sans-serif',
                placement: { x: 0.5, y: 0.56, anchor: 'center' },
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={glassWipe()} timing={houseTiming} />

        {/* Beat 2 — the diff on the glass card */}
        <TransitionSeries.Sequence durationInFrames={114}>
          <CodeDiff
            {...codeDiffSchema.parse({
              title: 'motion.ts',
              lines: [
                { text: "const onda = motion('default');", type: 'remove' },
                { text: "const onda = motion('identity');", type: 'add' },
                { text: '  damping: 200,', type: 'add' },
                { text: 'export default onda;', type: 'context' },
              ],
              lineDelay: 5,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
