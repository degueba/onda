'use client';

import React from 'react';
import {
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {
  WAVE_PATH,
  WAVE_VIEWBOX,
  WAVE_VIEWBOX_W,
  WAVE_VIEWBOX_H,
} from '../logo/WavePath';

// The hero reel's protagonist. After the LogoSting in Act 1 finishes drawing
// the wave in the center of the frame, THIS element fades in at the bottom
// edge — visually, the wave "moved down and shrunk" — and stays there for
// the rest of the reel. It's the only thing on screen from frame ~100 to
// frame 1800; everything else is a beat that comes and goes against it.
//
// Frame-deterministic by design: no CSS animations, no SMIL. The gradient
// stops slide horizontally as a function of the current frame, so the
// "shine" travels across the wave with the same value at the same frame
// every time (the Onda hard rule about render purity).
//
// Pulse: caller passes a `pulseAt` array of frames where the wave should
// briefly emphasize (used for the CameraShake moment in the install demo
// and the EndCard reveal). Each pulse is a 24-frame envelope that adds a
// 1.06× scale + an opacity bump on top of the steady-state.

const FADE_IN_START = 90;
const FADE_IN_END = 150;
const STEADY_OPACITY = 0.85;
const PULSE_DURATION = 24;
const PULSE_OPACITY_BOOST = 0.15;
const PULSE_SCALE_BOOST = 0.06;

// Width / height in pixels of the wave on a 1920×1080 canvas. Tuned to feel
// "present without crowding" — about half the frame wide, ~22% tall.
const WAVE_W = 960;
const WAVE_H = 240;
const BOTTOM_OFFSET = 32;

export function PersistentWave({ pulseAt = [] }: { pulseAt?: number[] }) {
  const frame = useCurrentFrame();

  // Steady-state fade-in. Held at zero until the LogoSting in Act 1 is
  // almost done drawing; ramps to full visibility over the next 60 frames.
  const fadeIn = interpolate(
    frame,
    [FADE_IN_START, FADE_IN_END],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  // Pulse envelope — for each entry in pulseAt, compute a 0→1→0 envelope
  // over PULSE_DURATION frames starting at that pulseAt frame. Sum the
  // envelopes (multiple pulses can briefly overlap, capped at 1.0).
  const pulseEnvelope = Math.min(
    1,
    pulseAt.reduce((sum, pulseFrame) => {
      const local = frame - pulseFrame;
      if (local < 0 || local > PULSE_DURATION) return sum;
      // Triangle wave: peaks at half-duration.
      const half = PULSE_DURATION / 2;
      const v = local <= half ? local / half : 1 - (local - half) / half;
      return sum + v;
    }, 0),
  );

  const opacity = fadeIn * (STEADY_OPACITY + pulseEnvelope * PULSE_OPACITY_BOOST);
  const scale = 1 + pulseEnvelope * PULSE_SCALE_BOOST;

  // Animated gradient — stops slide across the path over time, creating a
  // "shine traveling" effect on the wave stroke. Period = 240 frames (8s)
  // so the motion is calm, not a strobe. The shift is driven by frame, so
  // it's deterministic and looped over the 1800-frame reel duration.
  const driftPeriod = 240;
  const driftPhase = (frame % driftPeriod) / driftPeriod; // 0 → 1
  const driftX = (driftPhase - 0.5) * WAVE_VIEWBOX_W * 0.35; // ±18% of width

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: BOTTOM_OFFSET,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: 'center bottom',
        width: WAVE_W,
        height: WAVE_H,
        opacity,
        pointerEvents: 'none',
        // Soft glow under the wave — gives the accent stroke a warm halo
        // without needing a separate primitive layer.
        filter: 'drop-shadow(0 0 32px rgba(217, 107, 130, 0.35))',
      }}
    >
      <svg
        viewBox={WAVE_VIEWBOX}
        width={WAVE_W}
        height={WAVE_H}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="hero-persistent-wave"
            gradientUnits="userSpaceOnUse"
            x1={driftX}
            y1="0"
            x2={WAVE_VIEWBOX_W + driftX}
            y2="0"
          >
            <stop offset="0%" stopColor="#D96B82" />
            <stop offset="50%" stopColor="#E89AAB" />
            <stop offset="100%" stopColor="#D96B82" />
          </linearGradient>
          {/* Vertical white-to-transparent highlight on top — gives the
              stroke dimensional polish ("tube lit from above"). */}
          <linearGradient
            id="hero-persistent-wave-shine"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={WAVE_VIEWBOX_H}
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="40%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Base — the colored "tube body." */}
        <path
          d={WAVE_PATH}
          stroke="url(#hero-persistent-wave)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Highlight — thinner, mixed in screen-blend so the rose
            underneath stays warm rather than washing to white. */}
        <path
          d={WAVE_PATH}
          stroke="url(#hero-persistent-wave-shine)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
    </div>
  );
}
