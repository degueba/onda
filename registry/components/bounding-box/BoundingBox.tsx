import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { SPRING_SMOOTH, DURATION } from '../../../lib/motion';
import { HOUSE_EASE } from '../../../lib/easing';
import { entryFade, entryScale } from '../../../lib/choreography';
import { boundingBoxSchema, type BoundingBoxProps } from './schema';

export { boundingBoxSchema, type BoundingBoxProps };

/**
 * A UI annotation bounding box — a rectangle outline that strokes itself on
 * like a selection marquee around a region, with optional corner ticks and an
 * optional label tag pinned to the top-left corner. For highlighting a UI
 * element in docs / tutorial videos. The accent is earned here.
 *
 * @example
 * <BoundingBox label="Settings" x={0.2} y={0.3} width={0.4} height={0.3} />
 */
export const BoundingBox: React.FC<BoundingBoxProps> = ({
  x,
  y,
  width: wFrac,
  height: hFrac,
  label,
  color,
  delay,
  drawDuration,
  strokeWidth,
  corners,
  labelColor,
  fontSize,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: canvasW, height: canvasH } = useVideoConfig();

  // Box geometry in pixel space.
  const bx = x * canvasW;
  const by = y * canvasH;
  const bw = wFrac * canvasW;
  const bh = hFrac * canvasH;

  // Outline strokes on with SPRING_SMOOTH — calm, settled, no overshoot, just
  // like draw-on. The marquee traces the perimeter from the top-left corner,
  // clockwise, then stays. evolvePath turns 0→1 progress into the
  // dasharray/dashoffset pair that "draws" the path.
  const drawProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: drawDuration,
  });

  // Closed rectangle path, clockwise from the top-left corner.
  const rectPath = `M ${bx} ${by} L ${bx + bw} ${by} L ${bx + bw} ${by + bh} L ${bx} ${by + bh} Z`;
  const { strokeDasharray, strokeDashoffset } = evolvePath(drawProgress, rectPath);

  // Corner ticks fade in once the outline has essentially landed — one move at
  // a time. A short L-shaped mark hugs each corner just inside the outline.
  const tickLen = Math.min(bw, bh) * 0.14;
  const cornersDelay = delay + drawDuration;
  const { opacity: tickOpacity } = entryFade({
    frame,
    fps,
    delay: cornersDelay,
    durationInFrames: DURATION.fast,
  });

  // Label tag pinned to the top-left corner, fading + scaling in alongside the
  // corner ticks. The two phases — draw, then ticks + tag — keep the eye on one
  // thing at a time.
  const tagFade = entryFade({ frame, fps, delay: cornersDelay, durationInFrames: DURATION.base });
  const tagScale = entryScale({ frame, fps, delay: cornersDelay, durationInFrames: DURATION.base });

  // Outline opacity eases up with the draw (0.4 → 1) so the line gains presence
  // as it lands rather than popping in at full strength.
  const outlineOpacity = interpolate(drawProgress, [0, 1], [0.4, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });

  // L-shaped tick at a corner. `sx`/`sy` are the horizontal/vertical directions
  // the two legs extend (inward from the corner).
  const cornerTick = (cx: number, cy: number, sx: number, sy: number, key: string) => (
    <path
      key={key}
      d={`M ${cx + sx * tickLen} ${cy} L ${cx} ${cy} L ${cx} ${cy + sy * tickLen}`}
      stroke={color}
      strokeWidth={strokeWidth + 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={tickOpacity}
    />
  );

  return (
    <AbsoluteFill>
      <svg
        width={canvasW}
        height={canvasH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <path
          d={rectPath}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          opacity={outlineOpacity}
        />
        {corners && (
          <>
            {cornerTick(bx, by, 1, 1, 'tl')}
            {cornerTick(bx + bw, by, -1, 1, 'tr')}
            {cornerTick(bx + bw, by + bh, -1, -1, 'br')}
            {cornerTick(bx, by + bh, 1, -1, 'bl')}
          </>
        )}
      </svg>
      {label !== '' && (
        <div
          style={{
            position: 'absolute',
            left: bx,
            top: by,
            // Pin the tag just above the top-left corner. Centering translate is
            // chained with entryScale's scale so fade and scale stay locked.
            transform: `translateY(-100%) ${tagScale.transform}`,
            transformOrigin: 'bottom left',
            opacity: tagFade.opacity,
            backgroundColor: color,
            borderRadius: 6,
            padding: '4px 10px',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              color: labelColor,
              fontSize,
              fontFamily,
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default BoundingBox;
