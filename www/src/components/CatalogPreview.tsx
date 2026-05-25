'use client';

import { useMemo } from 'react';
import { ComponentPreview } from './ComponentPreview';
import { COMPONENT_REGISTRY } from './componentRegistry';

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
// `audio-clip` has no visual at all and `logo-sting` blasts a loud chord
// on hover. We render a quiet placeholder instead.
const NO_PREVIEW = new Set<string>(['audio-clip']);

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

  const defaults = useMemo(() => {
    if (!entry) return {} as Record<string, unknown>;
    const base = entry.schema.parse({}) as Record<string, unknown>;
    return { ...base, ...(entry.defaultPropsOverride ?? {}) };
  }, [entry]);

  // Two nested layers on purpose:
  //   • Outer (.onda-shimmer-border): no overflow clipping, so the
  //     rotating gradient ring + blurred halo (CSS pseudos at inset:-1px
  //     and inset:-3px) can paint past the card edge.
  //   • Inner: clips the Player to a rounded rectangle. Without this,
  //     the video's hard edges would bleed past the shimmer ring.
  return (
    <div
      className="onda-shimmer-border relative w-full rounded-xl"
      style={{ aspectRatio: '16 / 9' }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-onda-bg border border-onda-border">
        {entry && !NO_PREVIEW.has(slug) ? (
          <ComponentPreview
            component={entry.component}
            inputProps={defaults as never}
            durationInFrames={120}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            hoverToPlay
          />
        ) : (
          <Placeholder title={title} />
        )}
      </div>
    </div>
  );
}
