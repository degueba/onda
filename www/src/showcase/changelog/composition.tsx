'use client';

import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { ChapterCard, chapterCardSchema } from '@onda/registry/components/chapter-card/ChapterCard';
import { CodeDiff, codeDiffSchema } from '@onda/registry/components/code-diff/CodeDiff';
import { WordStagger, wordStaggerSchema } from '@onda/registry/components/word-stagger/WordStagger';
import { EndCard, endCardSchema } from '@onda/registry/components/end-card/EndCard';
import { MeshGradient, meshGradientSchema } from '@onda/registry/components/mesh-gradient/MeshGradient';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

export const ChangelogComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <MeshGradient {...meshGradientSchema.parse({ opacity: 0.3, speed: 0.7 })} />

      <TransitionSeries>
        {/* Beat 1 — version stamp */}
        <TransitionSeries.Sequence durationInFrames={70}>
          <ChapterCard
            {...chapterCardSchema.parse({ number: 'v1.4.0', chapter: "What's new", placement: 'center' })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 2 — the actual diff */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <CodeDiff
            {...codeDiffSchema.parse({
              title: 'motion.ts',
              lines: [
                { text: "const onda = motion('default');", type: 'remove' },
                { text: "const onda = motion('identity');", type: 'add' },
                { text: 'export default onda;', type: 'context' },
              ],
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 3 — highlights */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <WordStagger
            {...wordStaggerSchema.parse({
              text: '12 transitions · 10 components',
              size: 'subheading',
              stagger: 4,
              justify: 'center',
              color: '#F2F2F4',
              fontFamily: '"Space Grotesk", ui-monospace, monospace',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={houseTiming} />

        {/* Beat 4 — update */}
        <TransitionSeries.Sequence durationInFrames={65}>
          <EndCard
            {...endCardSchema.parse({ cta: 'Update now', handles: ['ondajs@latest'], placement: 'center' })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette {...vignetteSchema.parse({ intensity: 0.5 })} />
    </AbsoluteFill>
  );
};
