'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WAVE_PATH, WAVE_VIEWBOX } from '../logo/WavePath';

// Small wave-shaped divider — replaces the QuoteCard's straight rule in the
// hero's Act 3. The same path the brand mark and PersistentWave use, scaled
// down and drawn with an evolving stroke-dasharray so it strokes in over
// `duration` frames. Frame-deterministic.
//
// Why this exists: the brief says the wave persists through every cut. Even
// the punctuation in the quote scene is the wave shape. Using the registry's
// QuoteCard would render a straight MaskReveal rule; the hero needs the
// continuity, so we render the quote's middle bar with the brand path.

const WAVE_PATH_LENGTH = 100; // pathLength attribute normalizes to 100

export function WaveDivider({
  delay = 0,
  duration = 18,
  width = 120,
  height = 30,
  color = '#D96B82',
  strokeWidth = 2.2,
}: {
  delay?: number;
  duration?: number;
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // SPRING_SMOOTH-driven progress 0 → 1 over `duration` frames.
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 100, mass: 1 },
    durationInFrames: duration,
  });

  // Dash offset: full path hidden at 0, fully revealed at 1.
  const dashOffset = interpolate(progress, [0, 1], [WAVE_PATH_LENGTH, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      viewBox={WAVE_VIEWBOX}
      width={width}
      height={height}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <path
        d={WAVE_PATH}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={WAVE_PATH_LENGTH}
        strokeDasharray={WAVE_PATH_LENGTH}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}
