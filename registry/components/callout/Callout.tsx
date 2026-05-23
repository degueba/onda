import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade, entryScale } from '../../../lib/choreography';

export const calloutSchema = z.object({
  label: z.string().default('Look here'),
  x: z.number().min(0).max(1).default(0.5),                      // 0–1 canvas X
  y: z.number().min(0).max(1).default(0.5),                      // 0–1 canvas Y
  position: z
    .enum(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
    .default('top-right'),
  offset: z.number().int().min(0).default(160),                  // px from anchor to bubble
  delay: z.number().int().min(0).default(0),
  duration: z.number().int().min(1).default(DURATION.base),      // bubble reveal frames
  lineDelay: z.number().int().min(0).default(6),                 // frames after bubble before arrow
  lineDuration: z.number().int().min(1).default(DURATION.base),  // arrow draw-on frames
  color: z.string().default('#F2F2F4'),                          // --onda-text
  bgColor: z.string().default('#0E0E12'),                        // --onda-surface
  borderColor: z.string().default('#26262E'),                    // --onda-border-lit
  arrowColor: z.string().default('#F2F2F4'),
  arrowWidth: z.number().default(2),
  fontSize: z.number().default(20),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  canvasWidth: z.number().int().min(1).default(1920),
  canvasHeight: z.number().int().min(1).default(1080),
});

export type CalloutProps = z.infer<typeof calloutSchema>;

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
  canvasWidth,
  canvasHeight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
  const anchorX = x * canvasWidth;
  const anchorY = y * canvasHeight;

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
        width={canvasWidth}
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
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
