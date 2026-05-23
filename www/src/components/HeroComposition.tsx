'use client';

import { Sequence } from 'remotion';
import { BlurReveal } from '@onda/registry/components/blur-reveal/BlurReveal';

// Landing hero: a small title-card composition built out of two BlurReveals.
// The wordmark lands first, then the tagline follows ~1.6s later. Both use
// the standard component (not bespoke motion) so the hero literally is what
// Onda makes.
export const HeroComposition: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <BlurReveal
        text="Onda"
        delay={12}
        duration={22}
        fontSize={240}
        color="#F2F2F4"
        fontFamily='"Clash Display", sans-serif'
      />
      <Sequence from={48} layout="none">
        <BlurReveal
          text="premium motion graphics for Remotion"
          delay={0}
          duration={20}
          fontSize={30}
          color="#8E8E98"
          fontFamily='"Clash Display", sans-serif'
        />
      </Sequence>
    </div>
  );
};
