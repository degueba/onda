'use client';

import dynamic from 'next/dynamic';

// Loads the actual Player-using preview on the client only.
// Static prerender of <Player /> hits a React-copy mismatch and isn't useful
// anyway — the preview only does anything once it starts playing.
const LivePreview = dynamic(
  () => import('./LivePreview').then((m) => m.LivePreview),
  { ssr: false },
);

export function LivePreviewSection({ slug }: { slug: string }) {
  return <LivePreview slug={slug} controls />;
}
