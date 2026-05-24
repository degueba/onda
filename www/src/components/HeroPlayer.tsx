'use client';

import { ComponentPreview } from './ComponentPreview';
import { HeroComposition, HERO_DURATION_FRAMES } from './HeroComposition';

// Duration is sourced from HeroComposition so the two never drift —
// the composition owns its own timing table (BEATS[]); the Player just
// reads the total.

const EMPTY_PROPS = {} as const;

export function HeroPlayer() {
  return (
    <ComponentPreview
      component={HeroComposition}
      inputProps={EMPTY_PROPS}
      durationInFrames={HERO_DURATION_FRAMES}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
    />
  );
}
