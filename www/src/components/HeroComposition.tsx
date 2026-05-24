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

// Landing hero — 24-second reel, five beats, every one a registered Onda
// primitive or scene block. Layered top-to-bottom:
//
//   GradientShift bg     ← always drifting, dusty-rose warm dark
//   Scene Sequences      ← the five beats, each in a SceneTransition
//   GrainOverlay         ← atmospheric texture
//   Vignette             ← cinematic frame
//
// The persistent gradient + grain + vignette layers give the reel
// continuous motion AND ambient color even while individual scenes are
// at their "settled" state. Without them the brief stillness between
// each scene's spring entry and the crossfade-out read as dead air.
//
// Beats (30fps, FADE = 36, overlap 36f between adjacent):
//   1   0   → 144     4.8s   LogoSting (BRAND wave path, accent rose)
//   2   108 → 258     5.0s   StatCard (38 components)
//   3   222 → 402     6.0s   InstallToRender — npx ondajs → BlurReveal in accent
//   4   366 → 522     5.2s   QuoteCard (Saul Bass)
//   5   486 → 720     7.8s   EndCard ("Made with Onda" + onda.video)
//   total  720f = 24s

const FADE = 36;
export const HERO_DURATION_FRAMES = 720;

const BEATS = [
  { from: 0, duration: 144 },
  { from: 108, duration: 150 },
  { from: 222, duration: 180 },
  { from: 366, duration: 156 },
  { from: 486, duration: 234 },
];

// Brand wave — the same path the BrandLogo renders in the nav and the
// site favicon. Using the canonical asset here means the LogoSting beat
// opens with THE Onda mark, not a generic placeholder.
const logoProps = logoStingSchema.parse({
  title: 'Onda',
  d: WAVE_PATH,
  viewBox: WAVE_VIEWBOX,
  pathWidth: 480,
  pathHeight: 120,
  strokeWidth: 3,
  stroke: '#D96B82', // accent rose — color the wave itself
  accent: true,
});

const statProps = statCardSchema.parse({
  value: 38,
  label: 'components, one motion language',
  accent: true,
});

// Faux-terminal install line. Linear pacing is part of Typewriter's
// contract; duration here is total frames to type the whole string.
const installProps = typewriterSchema.parse({
  text: 'npx ondajs add blur-reveal',
  delay: 6,
  duration: 36, // ~1.2s to type 26 chars — brisk, readable
  cursor: true,
  color: '#F2F2F4',
  fontSize: 36,
  fontFamily: '"Space Grotesk", ui-monospace, monospace',
});

// The reveal that lands AFTER the typed command — and in accent rose,
// not white, so the wow beat earns its color. Delay math: 6f offset +
// 36f typing + ~18f beat-of-silence = ~60.
const revealProps = blurRevealSchema.parse({
  text: 'Onda',
  delay: 60,
  duration: 22,
  fontSize: 200,
  color: '#D96B82',
});

const quoteProps = quoteCardSchema.parse({ accent: true });

const endProps = endCardSchema.parse({
  cta: 'Made with Onda',
  handles: ['onda.video'],
  accent: true,
});

// Warm-dark drifting gradient — sits at the very bottom of the layer
// stack and rotates 0.25°/frame so there's ALWAYS motion in the frame
// even at peak-stillness moments of individual scenes. The colors
// stay deep (mostly black) with a hint of rose so the accent earned
// inside each scene still reads as the focal color.
const gradientProps = gradientShiftSchema.parse({
  from: '#08080A',
  to: '#1A0E12',
  angle: 135,
  speed: 0.25,
});

// Subtle grain — keeps the dark areas from going flat. Stays well
// below the cap that would start reading as noise on its own.
const grainProps = grainOverlaySchema.parse({
  opacity: 0.05,
  baseFrequency: 0.9,
  numOctaves: 1,
});

const vignetteProps = vignetteSchema.parse({ intensity: 0.7 });

/**
 * Each beat's enter / exit envelope. Three things ramp together:
 *
 *   opacity   0 → 1 → 1 → 0          standard crossfade
 *   scale     1.03 → 1 → 1 → 0.97    pull-in on entry, push-back on exit
 *   blur      6px → 0 → 0 → 6px      focus on entry, soft-out on exit
 *
 * Apple-keynote dissolve. The scale + blur deltas are deliberately tiny
 * so the transition reads as "two scenes blending" rather than "a
 * transition effect" announcing itself.
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
 * rose. The reel literally demonstrates the lib's promise in six
 * seconds.
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

      <BlurReveal {...revealProps} />
    </AbsoluteFill>
  );
}

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Layer 1 — persistent warm-dark drift. Always moving, always
          slightly colored. Renders for the full 720 frames. */}
      <GradientShift {...gradientProps} />

      {/* Layer 2 — the five beats, each in its own Sequence + transition. */}
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

      <Sequence from={BEATS[3].from} durationInFrames={BEATS[3].duration}>
        <SceneTransition durationInFrames={BEATS[3].duration}>
          <QuoteCard {...quoteProps} />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS[4].from} durationInFrames={BEATS[4].duration}>
        <SceneTransition durationInFrames={BEATS[4].duration}>
          <EndCard {...endProps} />
        </SceneTransition>
      </Sequence>

      {/* Layer 3 — subtle grain on top of scenes. Keeps the flat areas
          alive. */}
      <GrainOverlay {...grainProps} />

      {/* Layer 4 — cinematic edge frame. Top of the stack so it darkens
          everything below at the corners. */}
      <Vignette {...vignetteProps} />
    </AbsoluteFill>
  );
};
