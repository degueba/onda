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
  BarChart,
  barChartSchema,
} from '@onda/registry/components/bar-chart/BarChart';
import {
  QuoteCard,
  quoteCardSchema,
} from '@onda/registry/components/quote-card/QuoteCard';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';

// Landing hero — 28-second reel built ENTIRELY from registered Onda scene
// blocks, framed by a persistent Vignette. Five beats:
//
//   beat 1   0   → 150     5.0s   LogoSting          wave draws + "Onda" + accent
//   beat 2   126 → 306     6.0s   StatCard           38 components
//   beat 3   282 → 462     6.0s   BarChart           Remotion / AE / Lottie
//   beat 4   438 → 648     7.0s   QuoteCard          Saul Bass on motion
//   beat 5   624 → 840     7.2s   EndCard            "Made with Onda" + onda.video
//   total    840 frames = 28s — matches HERO_DURATION_FRAMES in HeroPlayer.
//
// Consecutive beats overlap by FADE = 24 frames; SceneFade adds an opacity
// envelope that crossfades them at the seam. Hard cuts on top of each scene
// block's spring-driven entry felt jumpy; the crossfade lets the previous
// scene drift out while the next blurs in, so the reel reads as one
// continuous piece instead of five abutted clips.
//
// Vignette renders OUTSIDE every Sequence so it persists across the full
// 28s — a quiet cinematic frame that ties everything together. It's
// pointer-events:none and has no entry motion (static atmospheric layer),
// so it costs nothing visually beyond the slight edge darkening.
//
// schema.parse(overrides) is the canonical way to get fully-typed props
// out of our zod schemas — `.default()` runs at parse time, not type-
// inference time, so z.infer makes every prop look required. Same pattern
// LivePreview uses.

const FADE = 24;
export const HERO_DURATION_FRAMES = 840;

// Per-beat duration table — kept inline rather than scattered through the
// JSX so the crossfade math is obvious at a glance.
const BEATS = [
  { from: 0, duration: 150 }, // 1 — LogoSting
  { from: 126, duration: 180 }, // 2 — StatCard
  { from: 282, duration: 180 }, // 3 — BarChart
  { from: 438, duration: 210 }, // 4 — QuoteCard (longer hold; quotes need to read)
  { from: 624, duration: 216 }, // 5 — EndCard (final frame of the loop)
];

const logoProps = logoStingSchema.parse({
  title: 'Onda',
  accent: true,
});

const statProps = statCardSchema.parse({
  value: 38,
  label: 'components, one motion language',
  accent: true,
});

const chartProps = barChartSchema.parse({});

const quoteProps = quoteCardSchema.parse({ accent: true });

const endProps = endCardSchema.parse({
  cta: 'Made with Onda',
  handles: ['onda.video'],
  accent: true,
});

// Vignette is the persistent atmospheric layer. Slightly stronger than the
// component's default so the dark edges feel cinematic without crowding the
// scene blocks' centered content. innerRadius left at the default 40 so
// the clear center is generous.
const vignetteProps = vignetteSchema.parse({ intensity: 0.65 });

/**
 * Opacity envelope around a scene — fades in over the first `fade` frames,
 * holds at 1, fades out over the last `fade` frames. Wrapped around each
 * Sequence's content so consecutive (overlapping) beats crossfade at the
 * seam instead of hard-cutting.
 *
 * Easing is the HOUSE_EASE bezier we use for every opacity transition in
 * the library — keeps the hero motion feeling like one piece of fabric
 * with the rest of the catalog.
 */
function SceneFade({
  children,
  durationInFrames,
  fade = FADE,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  fade?: number;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Beat 1 — LogoSting. The branded opener: wave path draws itself in,
          "Onda" settles beneath, accent rule lands. Replaces the static
          TitleCard so the very first second of the reel demonstrates DrawOn,
          ScaleIn, and Underline composing into a single moment. */}
      <Sequence from={BEATS[0].from} durationInFrames={BEATS[0].duration}>
        <SceneFade durationInFrames={BEATS[0].duration}>
          <LogoSting {...logoProps} />
        </SceneFade>
      </Sequence>

      {/* Beat 2 — StatCard. Big counted-up number; label and accent rule
          settle in beneath. Proves the catalog has weight without saying so. */}
      <Sequence from={BEATS[1].from} durationInFrames={BEATS[1].duration}>
        <SceneFade durationInFrames={BEATS[1].duration}>
          <StatCard {...statProps} />
        </SceneFade>
      </Sequence>

      {/* Beat 3 — BarChart. Defaults compare Remotion / After Effects /
          Lottie; the largest bar (Remotion) earns the accent. Doubles as
          a why-we-bet-on-Remotion statement and a chart-primitive demo. */}
      <Sequence from={BEATS[2].from} durationInFrames={BEATS[2].duration}>
        <SceneFade durationInFrames={BEATS[2].duration}>
          <BarChart {...chartProps} />
        </SceneFade>
      </Sequence>

      {/* Beat 4 — Saul Bass pull quote (component defaults). "Motion is the
          difference between art and craft." From the patron saint of
          restrained graphic design; pitch-perfect for a motion-graphics lib.
          Longer hold (7s) so the multi-line quote has time to read. */}
      <Sequence from={BEATS[3].from} durationInFrames={BEATS[3].duration}>
        <SceneFade durationInFrames={BEATS[3].duration}>
          <QuoteCard {...quoteProps} />
        </SceneFade>
      </Sequence>

      {/* Beat 5 — EndCard. The lasting frame: brand promise + the domain,
          and the final earned accent moment of the reel. Slightly longer
          hold so the loop's last visible state is the home URL. */}
      <Sequence from={BEATS[4].from} durationInFrames={BEATS[4].duration}>
        <SceneFade durationInFrames={BEATS[4].duration}>
          <EndCard {...endProps} />
        </SceneFade>
      </Sequence>

      {/* Persistent atmospheric layer — sits above the scenes but is
          static, low-opacity, and pointer-events:none. Quiet cinematic
          frame that ties all 28 seconds into one piece. */}
      <Vignette {...vignetteProps} />
    </AbsoluteFill>
  );
};
