import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { drawOnSchema, type DrawOnProps } from './schema';

export { drawOnSchema, type DrawOnProps };

/**
 * An SVG path that strokes itself in — the substrate for logos, icons, and
 * signature flourishes. Powered by `@remotion/paths`'s `evolvePath`.
 *
 * @example
 * <DrawOn d="M 10 50 Q 100 10 190 50" duration={24} />
 */
export const DrawOn: React.FC<DrawOnProps> = ({
  d, delay, duration, stroke, strokeWidth, viewBox, width, height, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // SPRING_SMOOTH-driven progress 0 → 1 keeps the stroke calm and settled.
  // No overshoot: the line lands at full length and stays — the Onda fingerprint.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // evolvePath translates a 0–1 progress into the dasharray/dashoffset pair
  // needed to "draw" the path from its start to its end.
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);

  return (
    <PlacementBox placement={placement}>
      <svg viewBox={viewBox} width={width} height={height} style={{ overflow: 'visible' }}>
        <path
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </PlacementBox>
  );
};
