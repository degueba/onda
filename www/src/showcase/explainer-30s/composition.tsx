'use client';

import React from 'react';
import { AbsoluteFill, Easing, Sequence } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import {
  TrackingIn,
  trackingInSchema,
} from '@onda/registry/components/tracking-in/TrackingIn';
import {
  WordStagger,
  wordStaggerSchema,
} from '@onda/registry/components/word-stagger/WordStagger';
import {
  TitleCard,
  titleCardSchema,
} from '@onda/registry/components/title-card/TitleCard';
import {
  Highlight,
  highlightSchema,
} from '@onda/registry/components/highlight/Highlight';
import {
  ShimmerSweep,
  shimmerSweepSchema,
} from '@onda/registry/components/shimmer-sweep/ShimmerSweep';
import {
  StatCard,
  statCardSchema,
} from '@onda/registry/components/stat-card/StatCard';
import {
  Terminal,
  terminalSchema,
} from '@onda/registry/components/terminal/Terminal';
import {
  EndCard,
  endCardSchema,
} from '@onda/registry/components/end-card/EndCard';
import {
  GradientShift,
  gradientShiftSchema,
} from '@onda/registry/components/gradient-shift/GradientShift';
import {
  DynamicGrid,
  dynamicGridSchema,
} from '@onda/registry/components/dynamic-grid/DynamicGrid';
import {
  GrainOverlay,
  grainOverlaySchema,
} from '@onda/registry/components/grain-overlay/GrainOverlay';
import {
  Vignette,
  vignetteSchema,
} from '@onda/registry/components/vignette/Vignette';
import { glassWipe } from '@onda/registry/transitions/glass-wipe/glassWipe';
import { depthPush } from '@onda/registry/transitions/depth-push/depthPush';
import { morph } from '@onda/registry/transitions/morph/morph';
import { zoom } from '@onda/registry/transitions/zoom/zoom';
import { dipToColor } from '@onda/registry/transitions/dip-to-color/dipToColor';
import { blur } from '@onda/registry/transitions/blur/blur';
import { crossFade } from '@onda/registry/transitions/cross-fade/crossFade';

// House timing pinned per cut. 18-frame base for calm cuts; 24-frame for
// the dipToColor accent so the accent register reads as deliberate, not
// a flicker. Same easing curve everywhere — that's the fingerprint.
const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);
const baseCut = linearTiming({ durationInFrames: 18, easing: HOUSE_EASE });
const accentCut = linearTiming({ durationInFrames: 24, easing: HOUSE_EASE });

// The "why Onda matters" trailer. Five acts in 30 seconds:
//   1. Premise   — programmatic video has been possible, but generic.
//   2. Answer    — Onda exists.
//   3. Proof     — the signature: calm by default, bold when it earns it.
//   4. Moat      — source you own, Zod-typed, agent-driveable.
//   5. CTA       — onda.video.
// Eight component types, seven transition flavors, one signature feel.
export const ExplainerComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Atmosphere stack — drifts the whole 30s underneath every cut.
          GradientShift gives slow color depth; DynamicGrid sits at low
          opacity so the canvas never feels flat. */}
      <GradientShift
        {...gradientShiftSchema.parse({
          from: '#08080A',
          to: '#1A0E12',
          angle: 135,
          speed: 0.2,
        })}
      />
      <Sequence from={0} durationInFrames={900}>
        <DynamicGrid
          {...dynamicGridSchema.parse({
            variant: 'dots',
            opacity: 0.14,
            speed: 0.18,
            glow: false,
          })}
        />
      </Sequence>

      <TransitionSeries>
        {/* ── Act 1 — Premise ──────────────────────────────────────── */}

        {/* 1a (0–3s) — TrackingIn states the domain. Cinematic open. */}
        <TransitionSeries.Sequence durationInFrames={108}>
          <TrackingIn
            {...trackingInSchema.parse({
              text: 'video. in code.',
              fontSize: 140,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={glassWipe({ direction: 'left' })} timing={baseCut} />

        {/* 1b (3–5s) — The question. Held still so it reads as a thought. */}
        <TransitionSeries.Sequence durationInFrames={72}>
          <WordStagger
            {...wordStaggerSchema.parse({
              text: 'what if it felt premium?',
              size: 'subheading',
              stagger: 4,
              justify: 'center',
              placement: 'center',
              color: '#8E8E98',
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={depthPush({ direction: 'left' })} timing={baseCut} />

        {/* ── Act 2 — Answer ───────────────────────────────────────── */}

        {/* 2 (5–10s) — Brand reveal. TitleCard composes BlurReveal +
            WordStagger + Underline — the signature in one beat. */}
        <TransitionSeries.Sequence durationInFrames={132}>
          <TitleCard
            {...titleCardSchema.parse({
              title: 'Onda',
              subtitle: 'motion graphics with a feel',
              titleSize: 'hero',
              subtitleSize: 'subheading',
              placement: 'center',
              accent: true,
            })}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={morph()} timing={baseCut} />

        {/* ── Act 3 — Proof: the signature ─────────────────────────── */}

        {/* 3a (10–13s) — Calm: Highlight earns the accent on "calm". */}
        <TransitionSeries.Sequence durationInFrames={96}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
            <Highlight
              {...highlightSchema.parse({
                text: 'calm by default',
                size: 'hero',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'no overshoot · spring-driven · 18-frame house',
                size: 'subheading',
                stagger: 3,
                justify: 'center',
                color: '#8E8E98',
                delay: 24,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={zoom({ direction: 'in', scaleAmount: 0.12 })} timing={baseCut} />

        {/* 3b (13–17s) — Bold: ShimmerSweep proves range without re-using
            the earned-color register. Two different motion fingerprints
            making the same point — "calm is default, not the ceiling." */}
        <TransitionSeries.Sequence durationInFrames={108}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
            <ShimmerSweep
              {...shimmerSweepSchema.parse({
                text: 'bold when it earns it',
                fontSize: 130,
                align: 'center',
                placement: 'center',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'full catalog · calm → kinetic · craft is the gate',
                size: 'subheading',
                stagger: 3,
                justify: 'center',
                color: '#8E8E98',
                delay: 36,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={dipToColor({ color: '#D96B82' })} timing={accentCut} />

        {/* 3c (17–21s) — The number. dipToColor through accent rose lands
            us on a hard data beat — one earned punctuation moment. */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <StatCard
              {...statCardSchema.parse({
                value: 88,
                label: 'components and transitions · one signature feel',
                accent: true,
                numberFontSize: 280,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={glassWipe({ direction: 'right' })} timing={baseCut} />

        {/* ── Act 4 — The moat ─────────────────────────────────────── */}

        {/* 4a (21–25s) — Terminal types the install command. "Source you
            own" stops being a tagline and becomes a thing you watched
            happen. */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Terminal
              {...terminalSchema.parse({
                command: 'npx ondajs add stat-card',
                output: [
                  '✓ added stat-card',
                  '✓ wrote 4 files to your project',
                  '   your code, your styles, your motion',
                ],
                typeSpeed: 36,
                outputDelay: 12,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={blur({ blurAmount: 12 })} timing={baseCut} />

        {/* 4b (25–27.5s) — The agent moat in two lines. Held tight so the
            close lands clean. */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'Zod-typed. agent-driveable.',
                size: 'hero',
                stagger: 4,
                justify: 'center',
              })}
            />
            <WordStagger
              {...wordStaggerSchema.parse({
                text: 'drive the same catalog from any LLM',
                size: 'subheading',
                stagger: 3,
                justify: 'center',
                color: '#8E8E98',
                delay: 18,
              })}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={crossFade()} timing={baseCut} />

        {/* ── Act 5 — Close ────────────────────────────────────────── */}

        {/* 5 (27.5–30s) — Onda.video. */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <EndCard
            {...endCardSchema.parse({
              cta: 'Made with Onda',
              handles: ['onda.video'],
              accent: true,
              placement: 'center',
            })}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Texture + frame — the two passes that make the whole 30s read
          as a single piece of motion, not a stitched reel. */}
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
