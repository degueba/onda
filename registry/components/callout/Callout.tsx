import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade, entryScale } from '../../../lib/choreography';
import { calloutSchema, type CalloutProps } from './schema';

export { calloutSchema, type CalloutProps };

/**
 * A label-and-arrow annotation pointing at a specific spot on the canvas —
 * tutorials, explainers, name-the-part. Bubble fades + scales in, arrow
 * draws on after a small beat.
 *
 * @example
 * <Callout label="Look here" x={0.6} y={0.4} position="top-right" />
 */
export const Callout: React.FC<CalloutProps> = ({
  label,
  x,
  y,
  position,
  offset,
  delay,
  duration,
  lineDelay,
  lineDuration,
  color,
  bgColor,
  borderColor,
  arrowColor,
  arrowWidth,
  fontSize,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Bubble reveal — combine the canonical helpers. entryScale provides the
  // scale transform (0.9 → 1); entryFade provides the matching opacity. Both
  // run on the same SPRING_SMOOTH so the fade and the scale stay locked.
  const fade = entryFade({ frame, fps, delay, durationInFrames: duration });
  const scaleStyle = entryScale({ frame, fps, delay, durationInFrames: duration });

  // Arrow draws on after the bubble lands. lineDelay gives the bubble a small
  // beat to settle before the eye follows the stroke to the anchor — calm,
  // one-thing-at-a-time pacing.
  const arrowProgress = spring({
    frame: Math.max(0, frame - delay - lineDelay),
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: lineDuration,
  });

  // Anchor in pixel space.
  const anchorX = x * width;
  const anchorY = y * height;

  // Bubble offset from anchor based on quadrant.
  const offsetX =
    position === 'top-right' || position === 'bottom-right' ? offset : -offset;
  const offsetY =
    position === 'bottom-left' || position === 'bottom-right' ? offset : -offset;

  const bubbleCenterX = anchorX + offsetX;
  const bubbleCenterY = anchorY + offsetY;

  // Arrow line: from the midpoint between bubble center and anchor (a rough
  // approximation of the bubble's anchor-facing edge — accurate enough at
  // the default offset, and avoids needing to measure the bubble) to the
  // anchor point. Clean line, no arrowhead — more on-brand.
  const bubbleEdgeX = anchorX + offsetX / 2;
  const bubbleEdgeY = anchorY + offsetY / 2;
  const arrowPath = `M ${bubbleEdgeX} ${bubbleEdgeY} L ${anchorX} ${anchorY}`;

  const { strokeDasharray, strokeDashoffset } = evolvePath(arrowProgress, arrowPath);

  return (
    <AbsoluteFill>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'visible' }}
      >
        <path
          d={arrowPath}
          stroke={arrowColor}
          strokeWidth={arrowWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: bubbleCenterX,
          top: bubbleCenterY,
          // Chain the centering translate with entryScale's scale transform.
          transform: `translate(-50%, -50%) ${scaleStyle.transform}`,
          opacity: fade.opacity,
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          padding: '8px 14px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7)',
        }}
      >
        <span
          style={{
            color,
            fontSize,
            fontFamily,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    </AbsoluteFill>
  );
};
