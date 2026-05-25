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

export function ShowcasePreview({ meta }: { meta: ShowcaseMeta }) {
  const [Component, setComponent] = useState<ComponentType<Record<string, never>> | null>(null);

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
      <div
        className="relative rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]"
        style={{ aspectRatio: `${meta.width} / ${meta.height}` }}
      >
        {meta.hasAudio && <AudioBadge />}
      </div>
    );
  }

  const durationInFrames = meta.duration * meta.fps;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]"
      style={{ aspectRatio: `${meta.width} / ${meta.height}` }}
    >
      <ComponentPreview
        component={Component}
        inputProps={{} as never}
        durationInFrames={durationInFrames}
        fps={meta.fps}
        compositionWidth={meta.width}
        compositionHeight={meta.height}
      />
      {meta.hasAudio && <AudioBadge />}
    </div>
  );
}
