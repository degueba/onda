'use client';

import { Thumbnail } from '@remotion/player';
import { AbsoluteFill } from 'remotion';
import { useMemo, useRef, type ComponentType } from 'react';
import { useAdaptiveCompositionSize } from '@onda/lib/adaptive-player';

type Props<T extends Record<string, unknown>> = {
  component: ComponentType<T>;
  inputProps: T;
  durationInFrames: number;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  /** Frame to render. Defaults to ~60% of the duration — past the
   *  entrance, before any exit, where a single still best conveys the
   *  component's settled state. */
  frameToDisplay?: number;
};

// Static, single-frame preview rendered by Remotion's `<Thumbnail>`. Used
// in place of `<Player>` on mobile catalog tiles where running ~88 live
// Players would burn battery for no real gain (the user taps through to
// the detail page for full playback).
//
// Wrapper structure mirrors ComponentPreview's outer div so the parent
// (CatalogPreview) can drop either component in interchangeably without
// adjusting the surrounding card chrome.
export function ThumbnailPreview<T extends Record<string, unknown>>({
  component: Component,
  inputProps,
  durationInFrames,
  fps,
  compositionWidth,
  compositionHeight,
  frameToDisplay,
}: Props<T>) {
  // Memoize so `<Thumbnail>` sees a stable component identity across
  // renders — same reasoning as ComponentPreview's Wrapped memo.
  const Wrapped = useMemo(() => {
    const WrappedComponent = (props: T) => (
      <AbsoluteFill
        style={{
          backgroundColor: '#08080A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Component {...props} />
      </AbsoluteFill>
    );
    return WrappedComponent;
  }, [Component]);

  const containerRef = useRef<HTMLDivElement>(null);
  const adaptive = useAdaptiveCompositionSize(
    containerRef,
    compositionWidth,
    compositionHeight,
  );

  const frame =
    frameToDisplay ?? Math.round(durationInFrames * 0.6);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Thumbnail
        component={Wrapped as any}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={adaptive.width}
        compositionHeight={adaptive.height}
        frameToDisplay={frame}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
