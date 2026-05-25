'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { ComponentPreview } from './ComponentPreview';
import { AudioBadge } from './AudioBadge';
import { loadShowcaseComponent, type ShowcaseMeta } from '@/lib/showcase';

// Client-side wrapper that lazy-loads a showcase composition and renders
// it inside the existing ComponentPreview (Player + autoplay + controls).
// Lazy so the gallery cards can be SSR'd without dragging Remotion into
// the server bundle; the actual preview only mounts on the client.

export function ShowcasePreview({
  meta,
  hoverToPlay = false,
  shimmer = false,
}: {
  meta: ShowcaseMeta;
  hoverToPlay?: boolean;
  /** Show the hover shimmer ring (gallery only; needs a `.group` ancestor to
   *  animate). Uses the mask-free `onda-shimmer-edge` — same as the components
   *  grid — so it survives the gallery's `columns-*` masonry. */
  shimmer?: boolean;
}) {
  const [Component, setComponent] = useState<ComponentType<Record<string, never>> | null>(null);

  // Two-layer card: OUTER carries size + the optional mask-free shimmer
  // (`onda-shimmer-edge` — a padding-gradient ring, no mask/filter, so it works
  // in this `columns-*` masonry); INNER (opaque) clips the player and covers
  // everything but the 1.5px ring. Same treatment as CatalogPreview.
  const outerClassName = shimmer
    ? 'relative w-full onda-shimmer-edge rounded-2xl'
    : 'relative w-full rounded-2xl';
  const innerClassName =
    'relative w-full h-full overflow-hidden rounded-2xl border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]';
  const aspectStyle = { aspectRatio: `${meta.width} / ${meta.height}` };

  useEffect(() => {
    let cancelled = false;
    loadShowcaseComponent(meta.slug).then((c) => {
      if (!cancelled) setComponent(() => c);
    });
    return () => {
      cancelled = true;
    };
  }, [meta.slug]);

  if (!Component) {
    return (
      <div className={outerClassName} style={aspectStyle}>
        <div className={innerClassName}>{meta.hasAudio && <AudioBadge />}</div>
      </div>
    );
  }

  const durationInFrames = meta.duration * meta.fps;

  return (
    <div className={outerClassName} style={aspectStyle}>
      <div className={innerClassName}>
        <ComponentPreview
          component={Component}
          inputProps={{} as never}
          durationInFrames={durationInFrames}
          fps={meta.fps}
          compositionWidth={meta.width}
          compositionHeight={meta.height}
          hoverToPlay={hoverToPlay}
        />
        {meta.hasAudio && <AudioBadge />}
      </div>
    </div>
  );
}
