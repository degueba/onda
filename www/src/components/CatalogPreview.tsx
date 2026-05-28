'use client';

import { useMemo } from 'react';
import { ComponentPreview } from './ComponentPreview';
import { ThumbnailPreview } from './ThumbnailPreview';
import { COMPONENT_REGISTRY } from './componentRegistry';
import { useIsMobile } from '@/lib/use-is-mobile';

// Static placeholder for slugs that don't have a visual preview (e.g.
// `audio-clip`) or aren't yet wired into the client registry. Keeps the
// grid uniform — every card has the same 16:9 footprint — without
// flashing an empty Player frame.
function Placeholder({ title }: { title: string }) {
  return (
    <div className="relative w-full h-full grid place-items-center bg-onda-bg">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-onda-faint">
        {title}
      </span>
    </div>
  );
}

// Slugs we deliberately don't auto-preview in the catalog grid.
// `audio-clip` has no visual at all. `video-clip` defaults to a remote sample
// video (BigBuckBunny) that throws an uncaught `MediaPlaybackError` whenever
// the browser can't fetch/play it (CORS/network/codec) — and there's no
// self-hosted video to fall back to — so previewing it risks a broken,
// error-throwing tile. We render a quiet placeholder for both instead.
const NO_PREVIEW = new Set<string>(['audio-clip', 'video-clip']);

// One catalog tile: a 16:9 hover-to-play preview of a single component.
//
// Important: we use `hoverToPlay` mode (see ComponentPreview) which:
//   • disables Player autoplay + its global first-interaction listeners
//   • plays only while hovered, resets to frame 0 on leave
//   • hides the play/pause overlay and time readout (gallery feel)
//
// That keeps a grid of N tiles cheap — 62 paused Players don't tick.
export function CatalogPreview({ slug, title }: { slug: string; title: string }) {
  const entry = COMPONENT_REGISTRY[slug];
  // On mobile (<768px), the grid swaps each live Player for a static
  // <Thumbnail>. A grid of ~88 ticking Players is wasteful on phones
  // (battery + CPU) for a tap-through-to-detail flow; YouTube-style
  // stills are the industry pattern. Desktop/tablet keep the existing
  // hover-to-play preview.
  const isMobile = useIsMobile();

  const defaults = useMemo(() => {
    if (!entry) return {} as Record<string, unknown>;
    const base = entry.schema.parse({}) as Record<string, unknown>;
    return { ...base, ...(entry.defaultPropsOverride ?? {}) };
  }, [entry]);

  // Two nested layers on purpose:
  //   • Outer (.onda-shimmer-edge): a mask-free shimmer — a conic-gradient
  //     background with 1.5px padding reveals a rotating ring around the card
  //     (glow via box-shadow). No mask/filter, so it survives every layout
  //     (this grid AND the showcase's `columns-*` masonry).
  //   • Inner: opaque, clips the Player to a rounded rectangle and covers
  //     everything but the 1.5px ring.
  return (
    <div
      className="onda-shimmer-edge relative w-full rounded-xl"
      style={{ aspectRatio: '16 / 9' }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-onda-bg border border-onda-border">
        {entry && !NO_PREVIEW.has(slug) ? (
          isMobile ? (
            <ThumbnailPreview
              component={entry.component}
              inputProps={defaults as never}
              durationInFrames={120}
              fps={30}
              compositionWidth={1920}
              compositionHeight={1080}
            />
          ) : (
            <ComponentPreview
              component={entry.component}
              inputProps={defaults as never}
              durationInFrames={120}
              fps={30}
              compositionWidth={1920}
              compositionHeight={1080}
              hoverToPlay
            />
          )
        ) : (
          <Placeholder title={title} />
        )}
      </div>
    </div>
  );
}
