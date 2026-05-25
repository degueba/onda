'use client';

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  BlurReveal,
  blurRevealSchema,
} from '@onda/registry/components/blur-reveal/BlurReveal';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  CountUp,
  countUpSchema,
} from '@onda/registry/components/count-up/CountUp';
import {
  Highlight,
  highlightSchema,
} from '@onda/registry/components/highlight/Highlight';
import {
  Underline,
  underlineSchema,
} from '@onda/registry/components/underline/Underline';
import {
  StatCard,
  statCardSchema,
} from '@onda/registry/components/stat-card/StatCard';
import {
  Typewriter,
  typewriterSchema,
} from '@onda/registry/components/typewriter/Typewriter';
import {
  WordRotate,
  wordRotateSchema,
} from '@onda/registry/components/word-rotate/WordRotate';
import {
  BarChart,
  barChartSchema,
} from '@onda/registry/components/bar-chart/BarChart';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  AudioVisualizer,
  audioVisualizerSchema,
} from '@onda/registry/components/audio-visualizer/AudioVisualizer';
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

// Landing hero — data-driven catalog reel.
//
// The honest demo for Onda IS the components. This file cycles through a
// curated subset of the catalog, one component per beat, hard-cuts on the
// beat boundary, small caption with the component name + slug at the
// bottom edge. ~30 seconds, loops cleanly.
//
// The reel is intentionally NOT a hand-crafted narrative film. Each beat
// renders one catalog component using its own internal layout and the
// canvas-aware `size` roles from lib/canvas — so nothing overlaps when the
// Player container shrinks below the 1920×1080 design canvas.
//
// Adding a component to the reel is a 1-entry append to `BEATS` below.
// No hand-choreographed transitions, no per-beat absolute positioning.
//
// `<Schema>.parse({...})` applies the schema's defaults so we only have to
// list the props the beat actually customizes — matches the convention the
// old narrative hero used and keeps each beat's props block readable.

const TRANSITION = 8; // frames of crossfade between beats — quick but soft
const DEFAULT_HOLD = 75; // frames per beat — 2.5s feels right at this density

type Beat = {
  slug: string;
  label: string;
  hold?: number; // frames; defaults to DEFAULT_HOLD
  render: () => React.ReactNode;
};

// Curated subset — represents typography, scene blocks, data, and
// cinematic close. Each beat uses size roles so it scales with the canvas
// instead of hardcoded pixels.
const BEATS: Beat[] = [
  {
    slug: 'blur-reveal',
    label: 'BlurReveal',
    render: () => (
      <BlurReveal
        {...blurRevealSchema.parse({
          text: 'Onda',
          size: 'hero',
          duration: 22,
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'title-card',
    label: 'TitleCard',
    hold: 90,
    render: () => (
      <TitleCard
        {...titleCardSchema.parse({
          title: 'Composable',
          subtitle: 'motion graphics for Remotion',
          titleSize: 'hero',
          subtitleSize: 'subheading',
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'word-stagger',
    label: 'WordStagger',
    render: () => (
      <WordStagger
        {...wordStaggerSchema.parse({
          text: 'motion that moves you',
          size: 'heading',
          stagger: 4,
          justify: 'center',
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'count-up',
    label: 'CountUp',
    render: () => (
      <CountUp
        {...countUpSchema.parse({
          from: 0,
          to: 1247,
          size: 'hero',
          suffix: '+',
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'highlight',
    label: 'Highlight',
    render: () => (
      <Highlight
        {...highlightSchema.parse({
          text: 'motion graphics',
          size: 'heading',
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'stat-card',
    label: 'StatCard',
    hold: 90,
    render: () => (
      <StatCard
        {...statCardSchema.parse({
          value: 42,
          label: 'components, one motion language',
          accent: true,
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'bar-chart',
    label: 'BarChart',
    hold: 90,
    render: () => <BarChart {...barChartSchema.parse({ placement: 'center' })} />,
  },
  {
    slug: 'audio-visualizer',
    label: 'AudioVisualizer',
    hold: 90,
    render: () => (
      <AudioVisualizer
        {...audioVisualizerSchema.parse({
          // Self-hosted WAV — see scripts/generate-sample-audio.mjs.
          // Schema default is a public remote URL meant for end users
          // with their own assets; that fails CORS in the browser.
          src: '/sample-audio.wav',
          variant: 'bars',
          numberOfSamples: 64,
          placement: 'center',
          width: 720,
          height: 160,
        })}
      />
    ),
  },
  {
    slug: 'underline',
    label: 'Underline',
    render: () => (
      <Underline
        {...underlineSchema.parse({
          text: 'motion graphics',
          size: 'heading',
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'word-rotate',
    label: 'WordRotate',
    hold: 105, // longer — rotation needs time to read
    render: () => (
      <WordRotate
        {...wordRotateSchema.parse({
          phrases: ['fast', 'beautiful', 'restrained'],
          size: 'hero',
          holdDuration: 20,
          transitionDuration: 10,
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'typewriter',
    label: 'Typewriter',
    render: () => (
      <Typewriter
        {...typewriterSchema.parse({
          text: 'npx ondajs add blur-reveal',
          size: 'subheading',
          cursor: true,
          duration: 45,
          placement: 'center',
        })}
      />
    ),
  },
  {
    slug: 'end-card',
    label: 'EndCard',
    hold: 90,
    render: () => (
      <EndCard
        {...endCardSchema.parse({
          cta: 'Made with Onda',
          handles: ['onda.video'],
          placement: 'center',
        })}
      />
    ),
  },
];

// Total duration — sum of each beat's hold. The Player reads this constant.
export const HERO_DURATION_FRAMES = BEATS.reduce(
  (sum, b) => sum + (b.hold ?? DEFAULT_HOLD),
  0,
);

// ---------- per-beat transition wrapper ----------

// Soft fade-in / fade-out at the beat boundaries. Easing matches the rest
// of Onda — `Easing.bezier(0.16, 1, 0.3, 1)` (HOUSE_EASE shape).
function BeatTransition({
  children,
  durationInFrames,
}: {
  children: React.ReactNode;
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const easing = Easing.bezier(0.16, 1, 0.3, 1);
  const keyframes = [
    0,
    TRANSITION,
    durationInFrames - TRANSITION,
    durationInFrames,
  ];
  const opacity = interpolate(frame, keyframes, [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

// ---------- caption + CTA overlay ----------

// Identifies the active beat from the current composition frame so the
// caption can label what the viewer is looking at. Same lookup the Series
// uses internally — replicated here so the overlay stays in sync without
// passing state through the tree.
function activeBeatIndex(frame: number): number {
  let cursor = 0;
  for (let i = 0; i < BEATS.length; i++) {
    const hold = BEATS[i].hold ?? DEFAULT_HOLD;
    if (frame < cursor + hold) return i;
    cursor += hold;
  }
  return BEATS.length - 1;
}

function Chrome() {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const i = activeBeatIndex(frame);
  const beat = BEATS[i];

  // Caption font size scales with the smaller canvas dimension so it stays
  // readable at any Player width without clipping or overflowing.
  const captionSize = Math.max(14, Math.round(Math.min(width, height) * 0.018));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* bottom-left: component name + slug */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          bottom: '5%',
          color: '#F2F2F4',
          fontFamily: '"Space Grotesk", ui-monospace, monospace',
          fontSize: captionSize,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}
      >
        <span style={{ fontWeight: 600 }}>{beat.label}</span>
        <span style={{ color: '#56565F', marginLeft: 10 }}>{beat.slug}</span>
      </div>

      {/* bottom-right: catalog CTA */}
      <div
        style={{
          position: 'absolute',
          right: '4%',
          bottom: '5%',
          color: '#8E8E98',
          fontFamily: '"Space Grotesk", ui-monospace, monospace',
          fontSize: captionSize,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        all 42 components →
      </div>
    </AbsoluteFill>
  );
}

// ---------- root ----------

export const HeroComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background — warm-dark drift, always on. */}
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E12',
          angle: 135,
          speed: 0.25,
        })}
      />

      {/* The reel — Series owns the beat-by-beat sequencing. */}
      <Series>
        {BEATS.map((beat) => {
          const hold = beat.hold ?? DEFAULT_HOLD;
          return (
            <Series.Sequence key={beat.slug} durationInFrames={hold}>
              <BeatTransition durationInFrames={hold}>
                {beat.render()}
              </BeatTransition>
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Caption + CTA — always on top, never overlaps the beat content
          because beats use placement='center' and chrome lives at the
          bottom margins. */}
      <Chrome />

      {/* Texture + edge frame. */}
      <GrainOverlay
        {...grainOverlaySchema.parse({
          opacity: 0.05,
          baseFrequency: 0.9,
          numOctaves: 1,
        })}
      />
      <Vignette {...vignetteSchema.parse({ intensity: 0.7 })} />
    </AbsoluteFill>
  );
};
