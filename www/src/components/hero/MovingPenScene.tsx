'use client';

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';

// MovingPenScene — the "dot as motion graphic" prototype.
//
// A glowing accent-rose dot enters from off-screen left, glides across the
// canvas along a curving path, leaves a trail behind it as it moves, and
// text fades in alongside as the pen passes through the center. Then the
// dot continues to the right and exits.
//
// This is real motion graphics — the protagonist is the DOT, and you watch
// it physically travel. The trail is the "ink" it leaves. Text appearing
// is the consequence of the pen reaching that part of the canvas.
//
// Implementation: a single SVG cubic-bezier path defines the pen's
// journey. @remotion/paths gives us frame-deterministic getPointAtLength
// so the dot's position is a pure function of frame number. The trail is
// the same path rendered with strokeDasharray sized to the path length,
// with strokeDashoffset interpolating from full-length (hidden) to zero
// (fully revealed) — the trail's leading edge is always exactly where
// the dot is.

const SCENE_DURATION = 180; // 6s at 30fps

// The pen's journey across a 1920×1080 canvas. Off-screen-left at the
// vertical midpoint, curves through the center, exits off-screen right.
// The cubic + smooth-cubic combo gives one continuous arc that crosses
// the writing area roughly horizontally.
const PATH_D =
  'M -100 540 C 360 200, 760 880, 960 540 S 1560 200, 2020 540';
const PATH_LENGTH = getLength(PATH_D);

// Timing within the 180-frame scene:
//   0   → 130    pen travels from entry to exit (130f = ~4.3s)
//   45  → 90     text fades in (synced to when pen is approaching center)
//   150 → 180    whole scene fades out (next-beat handoff)

export const MOVING_PEN_DURATION = SCENE_DURATION;

export const MovingPenScene: React.FC<{
  text?: string;
}> = ({ text = "Hi, I'm Onda!" }) => {
  const frame = useCurrentFrame();
  const easing = Easing.bezier(0.16, 1, 0.3, 1);

  // Pen progress 0 → 1. Eased so the pen accelerates in, glides smoothly
  // through the writing area, and decelerates out — feels like a real
  // hand/cursor movement instead of a constant linear scroll.
  const progress = interpolate(frame, [0, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  // Dot position at this frame — pure function of progress.
  const dotPos = getPointAtLength(PATH_D, progress * PATH_LENGTH);

  // The trail draws as the dot moves. strokeDasharray = full length,
  // strokeDashoffset interpolates from full (nothing visible) to zero
  // (fully revealed). The trail's leading edge is exactly where the dot
  // sits.
  const dashOffset = (1 - progress) * PATH_LENGTH;

  // Text fades in during frames 45→90. By then the pen is approaching
  // the center of the canvas — the text appears AS the pen passes
  // beneath it, so the viewer reads cause-and-effect: pen arrived,
  // text appeared.
  const textOpacity = interpolate(frame, [45, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  // Whole-scene fade-out for the handoff to the next beat.
  const sceneOpacity = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  // Pen scale — grows from a small dot as it enters, then stays full
  // through the writing portion. Small detail that adds personality.
  const dotScale = interpolate(frame, [0, 20], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, background: '#08080A' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Gradient applied to the trail — accent rose with a soft edge. */}
          <linearGradient id="pen-trail" x1="0" y1="0" x2="1920" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D96B82" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#D96B82" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D96B82" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Trail — drawn behind, glowing accent rose. */}
        <path
          d={PATH_D}
          stroke="url(#pen-trail)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
          style={{ filter: 'drop-shadow(0 0 16px rgba(217, 107, 130, 0.55))' }}
        />

        {/* Text — the line the pen is "writing." Centered above the
            horizontal-ish portion of the path; fades in as the pen
            arrives. Caveat font so the handwriting flavor stays. */}
        <text
          x="960"
          y="460"
          textAnchor="middle"
          fontFamily="var(--font-caveat), Caveat, cursive"
          fontWeight={600}
          fontSize={160}
          fill="#F2F2F4"
          opacity={textOpacity}
          style={{ filter: 'drop-shadow(0 4px 24px rgba(217, 107, 130, 0.25))' }}
        >
          {text}
        </text>

        {/* The pen tip — a glowing circle at the dot's current position.
            Slightly larger than the trail stroke so it reads as a
            distinct moving object, not just the trail's leading pixel. */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={11 * dotScale}
          fill="#D96B82"
          opacity={0.96}
          style={{
            filter:
              'drop-shadow(0 0 24px rgba(217, 107, 130, 0.9)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
          }}
        />
      </svg>
    </AbsoluteFill>
  );
};
