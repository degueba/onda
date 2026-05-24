'use client';

import { Sequence, AbsoluteFill } from 'remotion';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
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

// Landing hero — 30-second reel built ENTIRELY from registered Onda scene
// blocks. Five beats, each ~5–7 seconds, no bespoke motion: the hero IS
// what Onda makes, end-to-end. Visitors are watching a sample composition,
// not a marketing render.
//
// Why hard cuts (no crossfade between Sequences): every scene block has
// its own SPRING_SMOOTH-driven entry, so the seam BETWEEN scenes is the
// next scene's blur / rise / count-up. Adding a crossfade on top would
// fight that motion. The composition's coherence is the proof — the
// transitions feel like one motion language because they ARE one motion
// language (every block composes the same primitives).
//
// Why we resolve props via `schema.parse(overrides)`: zod's `.default()`
// kicks in at parse time, not at type-inference time, so `z.infer<T>`
// makes every prop required even though every component has defaults
// for everything. Parsing here gives us a fully-typed Props object with
// our overrides applied on top. Same trick LivePreview uses; reusing it
// keeps the failure surface small.
//
// Timing math (30fps):
//   beat 1: 0   → 150     5s   TitleCard          "Onda" + tagline
//   beat 2: 150 → 330     6s   StatCard           38 components
//   beat 3: 330 → 510     6s   BarChart           Remotion / AE / Lottie defaults
//   beat 4: 510 → 690     6s   QuoteCard          Saul Bass on motion (defaults)
//   beat 5: 690 → 900     7s   EndCard            "Made with Onda" + onda.video
//   total  900 frames = 30s — matches HERO_DURATION_FRAMES in HeroPlayer.

const titleProps = titleCardSchema.parse({
  title: 'Onda',
  subtitle: 'code-first motion graphics for Remotion',
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

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Beat 1 — title card. The opening note: brand name + tagline,
          accent underline as quiet punctuation. */}
      <Sequence from={0} durationInFrames={150}>
        <TitleCard {...titleProps} />
      </Sequence>

      {/* Beat 2 — stat card. Big counted-up number; label and accent rule
          settle in beneath. Proves the catalog has weight without saying so. */}
      <Sequence from={150} durationInFrames={180}>
        <StatCard {...statProps} />
      </Sequence>

      {/* Beat 3 — bar chart. Defaults compare Remotion / After Effects /
          Lottie; the largest bar (Remotion) earns the accent. Doubles as
          a why-we-bet-on-Remotion statement and a chart-primitive demo. */}
      <Sequence from={330} durationInFrames={180}>
        <BarChart {...chartProps} />
      </Sequence>

      {/* Beat 4 — Saul Bass pull quote (component default). "Motion is the
          difference between art and craft." From the patron saint of
          restrained graphic design; pitch-perfect for a motion-graphics lib. */}
      <Sequence from={510} durationInFrames={180}>
        <QuoteCard {...quoteProps} />
      </Sequence>

      {/* Beat 5 — end card. The lasting frame: brand promise + the domain,
          and the final earned accent moment of the reel. Slightly longer
          hold so the loop's last visible state is the home URL. */}
      <Sequence from={690} durationInFrames={210}>
        <EndCard {...endProps} />
      </Sequence>
    </AbsoluteFill>
  );
};
