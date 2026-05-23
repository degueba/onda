'use client';

import { ComponentPreview } from './ComponentPreview';
import { HeroComposition } from './HeroComposition';

// 6s loop: ~0.4s delay, ~0.7s wordmark reveal, ~1.6s before subtitle starts,
// ~0.7s subtitle reveal, then a generous settled hold before the loop.
const HERO_DURATION_FRAMES = 180;

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
