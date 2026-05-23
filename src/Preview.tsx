import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BlurReveal, type BlurRevealProps } from '../registry/components/blur-reveal/BlurReveal';

// Wraps BlurReveal on the Onda canvas — dark background, centered — so the
// Remotion preview shows the component the way it would actually be used.
export const BlurRevealPreview: React.FC<BlurRevealProps> = (props) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08080A',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BlurReveal {...props} />
    </AbsoluteFill>
  );
};
