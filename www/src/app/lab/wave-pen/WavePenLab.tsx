'use client';

import dynamic from 'next/dynamic';

// Client-only Player wrapper. The same pattern Hero uses to keep the
// Remotion runtime out of the server-rendered tree.

const ComponentPreview = dynamic(
  () =>
    import('@/components/ComponentPreview').then((m) => m.ComponentPreview),
  { ssr: false },
);

import {
  MovingPenScene,
  MOVING_PEN_DURATION,
} from '@/components/hero/MovingPenScene';

const EMPTY_PROPS = {} as const;

export function WavePenLab() {
  return (
    <ComponentPreview
      component={MovingPenScene}
      inputProps={EMPTY_PROPS}
      durationInFrames={MOVING_PEN_DURATION}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
    />
  );
}
