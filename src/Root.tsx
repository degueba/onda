import React from 'react';
import { Composition } from 'remotion';
import { blurRevealSchema } from '../registry/components/blur-reveal/BlurReveal';
import { BlurRevealPreview } from './Preview';
import { showcases } from './showcases';

export const Root: React.FC = () => {
  return (
    <>
      {/* Single-component smoke test — useful for working on the
          BlurReveal primitive in isolation in Remotion Studio. */}
      <Composition
        id="BlurReveal"
        component={BlurRevealPreview}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        schema={blurRevealSchema}
        defaultProps={{
          kind: 'blur-reveal',
          text: 'Onda',
          delay: 0,
          duration: 20,
          color: '#F2F2F4',
          fontSize: 96,
          fontFamily: '"Clash Display", sans-serif',
        }}
      />

      {/* All 31 showcase compositions (the same set the website's
          gallery plays via <Player>) registered for
          `pnpm render <slug>` and Remotion Studio. Dimensions and
          duration come from each showcase's meta — single source of
          truth shared with the website. */}
      {showcases.map(({ meta, Component }) => (
        <Composition
          key={meta.slug}
          id={meta.slug}
          component={Component}
          durationInFrames={meta.duration * meta.fps}
          fps={meta.fps}
          width={meta.width}
          height={meta.height}
        />
      ))}
    </>
  );
};
