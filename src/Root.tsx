import React from 'react';
import { Composition } from 'remotion';
import { blurRevealSchema } from '../registry/components/blur-reveal/BlurReveal';
import { BlurRevealPreview } from './Preview';

export const Root: React.FC = () => {
  return (
    <>
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
    </>
  );
};
