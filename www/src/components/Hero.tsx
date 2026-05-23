'use client';

import dynamic from 'next/dynamic';

// The full Player chain lives in HeroPlayer (client-only) so the landing
// page's RSC layer never imports Remotion runtime.
const HeroPlayer = dynamic(
  () => import('./HeroPlayer').then((m) => m.HeroPlayer),
  { ssr: false },
);

export function Hero() {
  return (
    <div className="relative w-full">
      {/* The page's one earned color moment — a soft accent wash that sits
          behind the hero card. Quiet by design. */}
      <div
        aria-hidden
        className="
          absolute -inset-6 -z-10 opacity-25
          pointer-events-none
        "
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #D96B82 0%, transparent 55%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]">
        <HeroPlayer />
      </div>
    </div>
  );
}
