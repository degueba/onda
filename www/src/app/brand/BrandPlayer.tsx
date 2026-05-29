'use client';

// A small Remotion composition for the brand playground — real Onda
// choreography (entry fade-rise + hero landing) rendered through the theme
// tokens, so it shows how a brand reads *in motion*, not just as swatches.
// The colors/fonts are `THEME` var() tokens, so it re-skins from the
// `--onda-*` variables set by the enclosing page. Dynamic-imported with
// `ssr: false` by the page (the Remotion Player is client-only).

import { Player } from '@remotion/player';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { entryFade, entryFadeRise, heroReveal } from '@onda/lib/choreography';
import { DURATION } from '@onda/lib/motion';
import { THEME } from '@onda/lib/tokens';

const SCENE = { width: 1280, height: 720, fps: 30, durationInFrames: 150 };

function BrandScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrow = entryFade({ frame, fps, durationInFrames: DURATION.fast });
  const title = entryFadeRise({ frame, fps, delay: 6, durationInFrames: DURATION.base });
  const sub = entryFadeRise({ frame, fps, delay: 12, durationInFrames: DURATION.base });
  const cta = heroReveal({ frame, fps, delay: 20, durationInFrames: DURATION.slow });

  return (
    <AbsoluteFill
      style={{
        background: THEME.bg,
        fontFamily: THEME.fontBody,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* One earned accent glow. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 45% at 50% 42%, ${THEME.accent}, transparent 70%)`,
          opacity: 0.22,
        }}
      />
      <div style={{ position: 'relative', textAlign: 'center', padding: 48 }}>
        <div
          style={{
            opacity: eyebrow.opacity,
            color: THEME.faint,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: 18,
          }}
        >
          Your brand
        </div>
        <h1
          style={{
            ...title,
            fontFamily: THEME.fontDisplay,
            color: THEME.text,
            fontSize: 80,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            margin: '14px 0 0',
          }}
        >
          Motion, on brand.
        </h1>
        <p style={{ ...sub, color: THEME.dim, fontSize: 26, margin: '18px 0 0' }}>
          Your palette and type. <span style={{ color: THEME.accent }}>Onda</span> motion.
        </p>
        <div
          style={{
            ...cta,
            display: 'inline-block',
            marginTop: 34,
            background: THEME.accent,
            color: THEME.bg,
            padding: '14px 30px',
            borderRadius: 12,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          Get started
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default function BrandPlayer() {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${THEME.border}` }}>
      <Player
        component={BrandScene}
        durationInFrames={SCENE.durationInFrames}
        fps={SCENE.fps}
        compositionWidth={SCENE.width}
        compositionHeight={SCENE.height}
        style={{ width: '100%' }}
        autoPlay
        loop
        controls
      />
    </div>
  );
}
