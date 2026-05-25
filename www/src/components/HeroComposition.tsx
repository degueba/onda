'use client';

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
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
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';
import { morph } from '@onda/registry/transitions/morph/morph';
import { depthPush } from '@onda/registry/transitions/depth-push/depthPush';
import { blur } from '@onda/registry/transitions/blur/blur';
import { zoom } from '@onda/registry/transitions/zoom/zoom';
import type { TransitionPresentation } from '@remotion/transitions';

// Each transition factory returns a TransitionPresentation parameterized
// by a different concrete props shape, so we widen to `any` to store a
// heterogeneous mix in `BEATS`. Each entry is otherwise typed by its own
// factory call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTransition = TransitionPresentation<any>;

// Landing hero — data-driven catalog reel.
//
// The honest demo for Onda IS the components + transitions. This file
// cycles through a curated subset of the catalog, one component per beat,
// with a varied (but restrained) palette of catalog transitions between
// beats. Small caption with the component name + slug at the bottom edge.
// ~30 seconds, loops cleanly.
//
// Adding a component to the reel is a 1-entry append to `BEATS` below.
// Each beat also names the transition that *follows* it — the trailing
// beat's `transition` is ignored (there is no next sibling).

const DEFAULT_HOLD = 75; // frames per beat — 2.5s feels right at this density

// House timing — same easing every Onda primitive uses, matches
// `DURATION.base` from lib/motion.ts. Pinned here so every transition in
// the reel inherits the same rhythm.
const houseTiming = linearTiming({
  durationInFrames: 18,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

type Beat = {
  slug: string;
  label: string;
  hold?: number; // frames; defaults to DEFAULT_HOLD
  render: () => React.ReactNode;
  // Transition that plays AFTER this beat, into the next one. The last
  // beat's transition is ignored. Default is `crossFade()` — the catalog's
  // calm workhorse. Premium beats opt into morph / depthPush / blur / zoom.
  transition?: AnyTransition;
};

// Curated subset — represents typography, scene blocks, data, and a
// cinematic close. Each beat uses size roles so it scales with the canvas
// instead of hardcoded pixels.
const BEATS: Beat[] = [
  {
    slug: 'blur-reveal',
    label: 'BlurReveal',
    transition: morph(),
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
    transition: crossFade(),
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
    transition: morph(),
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
    transition: depthPush({ direction: 'left' }),
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
    transition: crossFade(),
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
    // The one "punch" moment in the reel. Used once, never more.
    transition: zoom({ direction: 'in', scaleAmount: 0.15 }),
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
    transition: crossFade(),
    render: () => <BarChart {...barChartSchema.parse({ placement: 'center' })} />,
  },
  {
    slug: 'audio-visualizer',
    label: 'AudioVisualizer',
    hold: 90,
    transition: blur({ blurAmount: 18 }),
    render: () => (
      <AudioVisualizer
        {...audioVisualizerSchema.parse({
          // Self-hosted music bed — the schema default is a public remote
          // URL meant for end users with their own assets; that fails CORS
          // in the browser.
          src: '/music.mp3',
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
    transition: morph(),
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
    transition: depthPush({ direction: 'right' }),
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
    transition: morph(),
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
    // No `transition` — trailing beat.
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

const TRANSITION_FRAMES = 18; // houseTiming.durationInFrames — kept in sync

// Total duration — sum of each beat's hold MINUS the overlap consumed by
// each between-beat transition (TransitionSeries plays sequences with the
// transition overlapping the boundary, so total < sum-of-holds). The
// Player reads this constant.
export const HERO_DURATION_FRAMES =
  BEATS.reduce((sum, b) => sum + (b.hold ?? DEFAULT_HOLD), 0) -
  TRANSITION_FRAMES * (BEATS.length - 1);

// ---------- caption + CTA overlay ----------

// Identifies the active beat from the current composition frame so the
// caption can label what the viewer is looking at. Mirrors how
// TransitionSeries overlaps the transition duration across the boundary —
// each beat's effective on-screen window is (hold - transitionFrames) past
// the cursor, except the last which holds the full duration.
function activeBeatIndex(frame: number): number {
  let cursor = 0;
  for (let i = 0; i < BEATS.length; i++) {
    const hold = BEATS[i].hold ?? DEFAULT_HOLD;
    const effective = i === BEATS.length - 1 ? hold : hold - TRANSITION_FRAMES;
    if (frame < cursor + effective) return i;
    cursor += effective;
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
        42 components · 12 transitions →
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

      {/* The reel — TransitionSeries owns the beat-by-beat sequencing,
          with one catalog transition between each pair of beats. */}
      <TransitionSeries>
        {BEATS.flatMap((beat, i) => {
          const hold = beat.hold ?? DEFAULT_HOLD;
          const nodes: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`${beat.slug}-seq`}
              durationInFrames={hold}
            >
              {beat.render()}
            </TransitionSeries.Sequence>,
          ];
          // Insert the named transition AFTER every beat except the last.
          if (i < BEATS.length - 1) {
            nodes.push(
              <TransitionSeries.Transition
                key={`${beat.slug}-trans`}
                presentation={beat.transition ?? crossFade()}
                timing={houseTiming}
              />,
            );
          }
          return nodes;
        })}
      </TransitionSeries>

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
