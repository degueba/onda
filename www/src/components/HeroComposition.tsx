'use client';

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {
  LogoSting,
  logoStingSchema,
} from '@onda/registry/components/logo-sting/LogoSting';
import {
  StatCard,
  statCardSchema,
} from '@onda/registry/components/stat-card/StatCard';
import {
  Typewriter,
  typewriterSchema,
} from '@onda/registry/components/typewriter/Typewriter';
import {
  BlurReveal,
  blurRevealSchema,
} from '@onda/registry/components/blur-reveal/BlurReveal';
import { CameraShake } from '@onda/registry/components/camera-shake/CameraShake';
import {
  StaggerGroup,
  staggerGroupSchema,
} from '@onda/registry/components/stagger-group/StaggerGroup';
import {
  QuoteCard,
  quoteCardSchema,
} from '@onda/registry/components/quote-card/QuoteCard';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  GrainOverlay,
  grainOverlaySchema,
} from '@onda/registry/components/grain-overlay/GrainOverlay';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { WAVE_PATH, WAVE_VIEWBOX } from './logo/WavePath';

// Landing hero — 30-second reel, six beats, every one a registered Onda
// primitive or scene block. Layered top-to-bottom:
//
//   GradientShift bg     ← always drifting, warm-dark, rose-tinged
//   Scene Sequences      ← six beats, each in a SceneTransition envelope
//   GrainOverlay         ← atmospheric texture
//   Vignette             ← cinematic frame
//
// One earned departure from the global crossfade: the BlurReveal inside
// InstallToRender is wrapped in a 12-frame CameraShake — a tiny WOW
// thud at THE wow moment, intentional emphasis rather than effect-as-noise.
//
// Beats (30fps, FADE = 36, overlap 36f between adjacent):
//   1   0   → 150     5.0s   LogoSting (brand wave, accent rose)
//   2   114 → 270     5.2s   StatCard (38 components)
//   3   234 → 444     7.0s   InstallToRender + CameraShake at the reveal
//   4   408 → 558     5.0s   StaggerGroup of 6 categories (range demo)
//   5   522 → 672     5.0s   QuoteCard (Saul Bass)
//   6   636 → 900     8.8s   EndCard (final hold)
//   total  900f = 30s. HERO_DURATION_FRAMES exported for HeroPlayer.

const FADE = 36;
export const HERO_DURATION_FRAMES = 900;

const BEATS = [
  { from: 0, duration: 150 },
  { from: 114, duration: 156 },
  { from: 234, duration: 210 }, // longer — wow beat needs to breathe
  { from: 408, duration: 150 },
  { from: 522, duration: 150 },
  { from: 636, duration: 264 },
];

const logoProps = logoStingSchema.parse({
  title: 'Onda',
  d: WAVE_PATH,
  viewBox: WAVE_VIEWBOX,
  pathWidth: 480,
  pathHeight: 120,
  strokeWidth: 3,
  stroke: '#D96B82',
  accent: true,
});

const statProps = statCardSchema.parse({
  value: 38,
  label: 'components, one motion language',
  accent: true,
});

const installProps = typewriterSchema.parse({
  text: 'npx ondajs add blur-reveal',
  delay: 6,
  duration: 36,
  cursor: true,
  color: '#F2F2F4',
  fontSize: 36,
  fontFamily: '"Space Grotesk", ui-monospace, monospace',
});

const revealProps = blurRevealSchema.parse({
  text: 'Onda',
  delay: 60,
  duration: 22,
  fontSize: 200,
  color: '#D96B82',
});

// The six Onda categories, cascading in via the canonical 4-frame stagger.
// Tells the breadth story without saying "look how broad we are." Centered
// column so it reads as a manifesto, not a comma-separated list.
const categoriesProps = staggerGroupSchema.parse({
  items: ['Entrances', 'Data', 'Graphics', 'Atmosphere', 'Cinematic', 'Scenes'],
  direction: 'column',
  align: 'center',
  gap: 12,
  fontSize: 56,
  color: '#F2F2F4',
});

const quoteProps = quoteCardSchema.parse({ accent: true });

const endProps = endCardSchema.parse({
  cta: 'Made with Onda',
  handles: ['onda.video'],
  accent: true,
});

const gradientProps = gradientShiftSchema.parse({
  from: '#08080A',
  to: '#1A0E12',
  angle: 135,
  speed: 0.25,
});

const grainProps = grainOverlaySchema.parse({
  opacity: 0.05,
  baseFrequency: 0.9,
  numOctaves: 1,
});

const vignetteProps = vignetteSchema.parse({ intensity: 0.7 });

/**
 * Each beat's enter / exit envelope. Opacity + scale + blur ramp together,
 * Apple-keynote-feel dissolve. See v3 commit message for the rationale on
 * delta sizes (kept tiny so it reads as "two scenes blending," not as a
 * transition effect announcing itself).
 */
function SceneTransition({
  children,
  durationInFrames,
  fade = FADE,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  fade?: number;
}) {
  const frame = useCurrentFrame();
  const easing = Easing.bezier(0.16, 1, 0.3, 1);
  const keyframes = [0, fade, durationInFrames - fade, durationInFrames];

  const opacity = interpolate(frame, keyframes, [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  const scale = interpolate(frame, keyframes, [1.03, 1, 1, 0.97], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  const blur = interpolate(frame, keyframes, [6, 0, 0, 6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/**
 * Beat 3 — the WOW. A faux terminal types the install command, then on
 * completion the BlurReveal it would install plays beneath in accent
 * rose, wrapped in a brief CameraShake. The shake is intentional
 * emphasis at the WOW moment — used once in the reel, not a recurring
 * effect, so it reads as punctuation rather than gimmick.
 */
function InstallToRender() {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 80,
        padding: '0 10%',
      }}
    >
      <div
        style={{
          background: 'rgba(14, 14, 18, 0.85)',
          border: '1px solid #1C1C22',
          borderRadius: 14,
          padding: '20px 28px',
          minWidth: 560,
          maxWidth: 680,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 30px 60px -34px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            color: '#56565F',
            fontFamily: '"Space Grotesk", ui-monospace, monospace',
            fontSize: 36,
            lineHeight: 1,
          }}
        >
          $
        </span>
        <Typewriter {...installProps} />
      </div>

      {/* The reveal — shaken at the exact frame the BlurReveal lands.
          The shake is delay-synced to the BlurReveal's reveal start
          (frame 60 of the beat) so the "thud" happens with the focus,
          not before or after. 12 frames is short enough to read as
          impact, not as instability. */}
      <CameraShake
        delay={60}
        duration={12}
        intensity={3}
        seed={7}
        decay
      >
        <BlurReveal {...revealProps} />
      </CameraShake>
    </AbsoluteFill>
  );
}

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Layer 1 — persistent warm-dark drift. Always moving. */}
      <GradientShift {...gradientProps} />

      {/* Layer 2 — the six beats. */}
      <Sequence from={BEATS[0].from} durationInFrames={BEATS[0].duration}>
        <SceneTransition durationInFrames={BEATS[0].duration}>
          <LogoSting {...logoProps} />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS[1].from} durationInFrames={BEATS[1].duration}>
        <SceneTransition durationInFrames={BEATS[1].duration}>
          <StatCard {...statProps} />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS[2].from} durationInFrames={BEATS[2].duration}>
        <SceneTransition durationInFrames={BEATS[2].duration}>
          <InstallToRender />
        </SceneTransition>
      </Sequence>

      {/* New beat — the six categories cascading in. Shows breadth in
          motion; pairs with beat 2's "38 components" by answering "of what?" */}
      <Sequence from={BEATS[3].from} durationInFrames={BEATS[3].duration}>
        <SceneTransition durationInFrames={BEATS[3].duration}>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StaggerGroup {...categoriesProps} />
          </AbsoluteFill>
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS[4].from} durationInFrames={BEATS[4].duration}>
        <SceneTransition durationInFrames={BEATS[4].duration}>
          <QuoteCard {...quoteProps} />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS[5].from} durationInFrames={BEATS[5].duration}>
        <SceneTransition durationInFrames={BEATS[5].duration}>
          <EndCard {...endProps} />
        </SceneTransition>
      </Sequence>

      {/* Layer 3 — subtle grain. */}
      <GrainOverlay {...grainProps} />

      {/* Layer 4 — cinematic edge frame. */}
      <Vignette {...vignetteProps} />
    </AbsoluteFill>
  );
};
