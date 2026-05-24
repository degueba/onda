'use client';

import { ComponentPreview } from './ComponentPreview';
import { HeroComposition } from './HeroComposition';

// 30-second loop (5 beats × 5–7s each, see HeroComposition for the timing
// table). Long for a hero, but each beat is a different scene block, so
// the first 5 seconds is enough hook for casual scrollers; engaged
// viewers get a full tour of what Onda makes.
const HERO_DURATION_FRAMES = 900;

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
