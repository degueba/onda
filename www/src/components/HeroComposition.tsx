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
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  FadeIn,
  fadeInSchema,
} from '@onda/registry/components/fade-in/FadeIn';
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
import { PersistentWave } from './hero/PersistentWave';
import { WaveDivider } from './hero/WaveDivider';

// Landing hero — 60-second reel, "the wave creates everything."
//
// The brand wave is the protagonist. It draws itself in (Act 1, full
// screen), then "moves down" — visually, the center wave fades out while
// a smaller persistent wave fades in at the bottom edge — and stays there
// for the next 48 seconds. Every scene that follows plays in the empty
// space above the persistent wave, with the wave pulsing on emphasis
// frames (the install reveal, the EndCard arrival). Even Act 3's quote
// uses a wave-shaped divider where a normal QuoteCard would have a
// straight rule. The wave is the connective tissue.
//
// Layer stack:
//
//   GradientShift          ← warm-dark drift, always
//   Sequences (the beats)
//   PersistentWave         ← from ~frame 90 to end — THE protagonist
//   GrainOverlay           ← subtle texture
//   Vignette               ← cinematic frame
//
// Four acts (30fps, 1800 frames = 60s):
//
//   ACT 1 — ORIGIN          0 → 360       12s
//     0  → 150    LogoSting (brand wave, accent rose)
//     90 → 360    PersistentWave fades in at the bottom (handoff)
//     150 → 360   StatCard "38 components" plays in the upper region
//
//   ACT 2 — POWER          330 → 990      ~22s
//     330 → 720   InstallToRender with CameraShake on the reveal
//     690 → 990   Categories cascade
//
//   ACT 3 — VOICE          960 → 1260     10s
//     Custom quote layout — WordStagger + WaveDivider + attribution
//
//   ACT 4 — MEMORY        1230 → 1800     ~19s
//     EndCard with accent=false; the PersistentWave at the bottom IS
//     the accent rule. The wave "returns home" to be the final brand
//     frame.

const FADE = 36;
export const HERO_DURATION_FRAMES = 1800;

const BEATS = {
  logoSting: { from: 0, duration: 150 },
  statCard: { from: 150, duration: 210 },
  install: { from: 330, duration: 390 }, // longer — wow beat, breathes
  categories: { from: 690, duration: 300 },
  quote: { from: 960, duration: 300 },
  endCard: { from: 1230, duration: 570 }, // long final hold
};

// Frame markers for PersistentWave's pulse moments — synced to the visual
// climaxes elsewhere in the reel.
const PULSE_FRAMES = [
  330 + 60 + 22, // install reveal lands (camera shake + BlurReveal settle)
  1230 + 24, // EndCard reveal starts
];

// ---------- props ----------

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

// Categories — six words cascading. "Scenes" gets the earned accent color
// inside the group; we render it as a custom layout (StaggerGroup doesn't
// accept per-item color, so we render it manually with identical motion).
const categoriesItems = [
  { text: 'Entrances', accent: false },
  { text: 'Data', accent: false },
  { text: 'Graphics', accent: false },
  { text: 'Atmosphere', accent: false },
  { text: 'Cinematic', accent: false },
  { text: 'Scenes', accent: true },
];

// Quote — Saul Bass via individual primitives so the divider can be the
// brand wave instead of a straight rule. Mirrors QuoteCard's beat order:
// quote words cascade → wave divider draws → attribution fades in.
const QUOTE_TEXT = 'Motion is the difference between art and craft.';
const QUOTE_AUTHOR = 'Saul Bass';
const QUOTE_ROLE = 'Graphic Designer';

const endProps = endCardSchema.parse({
  cta: 'Made with Onda',
  handles: ['onda.video'],
  // accent: false — the PersistentWave at the bottom is THIS scene's
  // accent rule. Removing the EndCard's internal underline lets the
  // wave be the unambiguous accent.
  accent: false,
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

// ---------- transitions ----------

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

// ---------- act-3 quote layout (custom — uses WaveDivider) ----------

function WaveQuote() {
  // Beat order matches QuoteCard: quote → divider → attribution.
  // Word count drives quote duration; divider lands ~8 frames after, then
  // attribution lands ~8 frames after divider finishes. Same math QuoteCard
  // uses internally, kept local so the timing aligns with the WaveDivider
  // we render instead of the MaskReveal.
  const words = QUOTE_TEXT.split(/\s+/).filter(Boolean);
  const QUOTE_STAGGER = 6;
  const QUOTE_PER_DURATION = 18;
  const quoteRevealEnd = (words.length - 1) * QUOTE_STAGGER + QUOTE_PER_DURATION;
  const dividerDelay = quoteRevealEnd + 8;
  const dividerDuration = 18;
  const attributionDelay = dividerDelay + dividerDuration + 4;

  const quoteProps = wordStaggerSchema.parse({
    text: QUOTE_TEXT,
    duration: QUOTE_PER_DURATION,
    stagger: QUOTE_STAGGER,
    justify: 'center',
    fontSize: 56,
    color: '#F2F2F4',
  });

  const authorProps = fadeInSchema.parse({
    text: QUOTE_AUTHOR,
    delay: attributionDelay,
    duration: 18,
    color: '#F2F2F4',
    fontSize: 22,
  });

  const roleProps = fadeInSchema.parse({
    text: QUOTE_ROLE,
    delay: attributionDelay,
    duration: 18,
    color: '#8E8E98',
    fontSize: 22,
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 10%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          maxWidth: '60%',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <WordStagger {...quoteProps} />
        </div>
        {/* Wave divider — replaces QuoteCard's straight rule. Same wave
            shape as everywhere else in the reel. */}
        <WaveDivider
          delay={dividerDelay}
          duration={dividerDuration}
          width={120}
          height={30}
          color="#D96B82"
          strokeWidth={2.5}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <FadeIn {...authorProps} />
          <FadeIn {...roleProps} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------- act-2 install demo ----------

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

      <CameraShake delay={60} duration={12} intensity={3} seed={7} decay>
        <BlurReveal {...revealProps} />
      </CameraShake>
    </AbsoluteFill>
  );
}

// ---------- act-2 categories layout (custom — accent on "Scenes") ----------

function Categories() {
  // Six category names cascading top-to-bottom on the canonical 4-frame
  // stagger. Rendered in white; the beat's earned accent moment lives in
  // the PersistentWave pulsing at the bottom of the frame underneath.
  // (Per-item color would need a registry change to StaggerGroup; deferring
  // until that's worth doing.)
  const props = staggerGroupSchema.parse({
    items: categoriesItems.map((c) => c.text),
    direction: 'column',
    align: 'center',
    gap: 12,
    fontSize: 56,
    color: '#F2F2F4',
  });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <StaggerGroup {...props} />
    </AbsoluteFill>
  );
}

// ---------- root ----------

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Layer 1 — warm-dark drifting bg. */}
      <GradientShift {...gradientProps} />

      {/* ACT 1 — Origin */}
      <Sequence from={BEATS.logoSting.from} durationInFrames={BEATS.logoSting.duration}>
        <SceneTransition durationInFrames={BEATS.logoSting.duration}>
          <LogoSting {...logoProps} />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS.statCard.from} durationInFrames={BEATS.statCard.duration}>
        <SceneTransition durationInFrames={BEATS.statCard.duration}>
          <StatCard {...statProps} />
        </SceneTransition>
      </Sequence>

      {/* ACT 2 — Power */}
      <Sequence from={BEATS.install.from} durationInFrames={BEATS.install.duration}>
        <SceneTransition durationInFrames={BEATS.install.duration}>
          <InstallToRender />
        </SceneTransition>
      </Sequence>

      <Sequence from={BEATS.categories.from} durationInFrames={BEATS.categories.duration}>
        <SceneTransition durationInFrames={BEATS.categories.duration}>
          <Categories />
        </SceneTransition>
      </Sequence>

      {/* ACT 3 — Voice */}
      <Sequence from={BEATS.quote.from} durationInFrames={BEATS.quote.duration}>
        <SceneTransition durationInFrames={BEATS.quote.duration}>
          <WaveQuote />
        </SceneTransition>
      </Sequence>

      {/* ACT 4 — Memory */}
      <Sequence from={BEATS.endCard.from} durationInFrames={BEATS.endCard.duration}>
        <SceneTransition durationInFrames={BEATS.endCard.duration}>
          <EndCard {...endProps} />
        </SceneTransition>
      </Sequence>

      {/* THE PROTAGONIST — persistent wave at the bottom, fades in during
          Act 1's handoff, stays for the rest of the reel, pulses on the
          install reveal and EndCard arrival. */}
      <PersistentWave pulseAt={PULSE_FRAMES} />

      {/* Layer 3 — subtle grain on top of scenes. */}
      <GrainOverlay {...grainProps} />

      {/* Layer 4 — cinematic edge frame. */}
      <Vignette {...vignetteProps} />
    </AbsoluteFill>
  );
};
