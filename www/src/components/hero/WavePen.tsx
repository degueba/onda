'use client';

import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

// WavePen — Tier-1 "the wave writes phrases" effect.
//
// Renders a phrase in Caveat (flowing handwriting font) as SVG text with
// fill: none + a colored stroke. A strokeDasharray equal to a generous
// upper bound on the path length, animated via strokeDashoffset from full
// → 0, produces an "outlines drawing themselves" effect. Letters stroke
// in roughly together rather than strictly left-to-right (true single-
// stroke writing is Tier 3 — see hero brief), but with Caveat the result
// reads visually as handwriting being drawn.
//
// Frame-deterministic: progress is a pure function of `frame - delay`.
// No SMIL, no CSS animations.
//
// Why we estimate path length: SVG's getComputedTextLength runs in the
// browser only, at render time, which Remotion's worker can't call from
// a deterministic frame function. We use an overshoot constant so the
// dash is always longer than the actual stroke perimeter — at offset 0
// the text is fully revealed regardless of exact length.

type Props = {
  text: string;
  delay?: number;
  /** Frames over which the writing happens. */
  duration?: number;
  /** Frames the line holds at full visibility after writing finishes. */
  hold?: number;
  /** Frames over which the text fades out at the end. Set 0 to never fade. */
  fadeOut?: number;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
};

// Generous overshoot — actual rendered text-outline perimeter is
// roughly text.length × fontSize × 4-6. We multiply by 12 for slack.
const DASH_OVERSHOOT = 12;

export function WavePen({
  text,
  delay = 0,
  duration = 60,
  hold = 30,
  fadeOut = 24,
  fontSize = 140,
  color = '#D96B82',
  strokeWidth = 2.5,
}: Props) {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - delay);
  const easing = Easing.bezier(0.16, 1, 0.3, 1);

  const dashLength = Math.ceil(text.length * fontSize * DASH_OVERSHOOT);

  // Writing progress 0 → 1 over `duration` frames.
  const writeProgress = interpolate(local, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  // Fade-out (optional) — starts after `duration + hold`.
  const fadeStart = duration + hold;
  const opacity = fadeOut > 0
    ? interpolate(local, [fadeStart, fadeStart + fadeOut], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing,
      })
    : 1;

  const dashOffset = dashLength * (1 - writeProgress);

  return (
    <svg
      width="100%"
      height={fontSize * 1.8}
      viewBox={`0 0 1600 ${Math.round(fontSize * 1.8)}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity, display: 'block' }}
    >
      <text
        x="800"
        y={fontSize * 1.2}
        textAnchor="middle"
        fontFamily="var(--font-caveat), Caveat, cursive"
        fontWeight={600}
        fontSize={fontSize}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashLength}
        strokeDashoffset={dashOffset}
        // Drop-shadow gives the rose stroke a warm halo that matches the
        // PersistentWave's filter — visually ties them as siblings.
        style={{
          filter: 'drop-shadow(0 0 14px rgba(217, 107, 130, 0.45))',
        }}
      >
        {text}
      </text>
    </svg>
  );
}
