import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { z } from 'zod';
import { DURATION, STAGGER, SPRING_SMOOTH, staggerFrames } from '../../../lib/motion';
import { entryScale, entryFade } from '../../../lib/choreography';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link Timeline} props. */
export const timelineSchema = z.object({
  /** Anchor points along the timeline. Order is preserved — left to right. */
  points: z
    .array(z.object({ label: z.string() }))
    .default([
      { label: 'Concept' },
      { label: 'Build' },
      { label: 'Ship' },
      { label: 'Iterate' },
    ]),
  /** Frames before the line begins to draw. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the horizontal line strokes itself on. */
  lineDuration: z.number().int().min(1).default(DURATION.slow),
  /** Frames between the line completing and the first dot appearing. */
  dotDelay: z.number().int().min(0).default(8),
  /** Frames between consecutive dot entrances. Canonical Onda stagger is `4`. */
  dotStagger: z.number().int().min(0).default(STAGGER),
  /** Per-dot entrance duration. */
  dotDuration: z.number().int().min(1).default(DURATION.base),
  /** Dot diameter in px. */
  dotSize: z.number().default(14),
  /** Line color. Defaults to `--onda-border`. */
  lineColor: z.string().default('#26262E'),
  /** Non-final dot color. Defaults to `--onda-text`. */
  dotColor: z.string().default('#F2F2F4'),
  /** Final dot color — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Label color. Defaults to `--onda-dim`. */
  labelColor: z.string().default('#8E8E98'),
  /** Label font size in px. */
  fontSize: z.number().default(22),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Timeline}. */
export type TimelineProps = z.infer<typeof timelineSchema>;

// SVG path coordinate space. The path is drawn in this 0..LINE_VB_WIDTH x
// 0..LINE_VB_HEIGHT box and stretched to the rendered container width via
// preserveAspectRatio='none' on the <svg>.
const LINE_VB_WIDTH = 1000;
const LINE_VB_HEIGHT = 4;
const LINE_PATH = `M 0 ${LINE_VB_HEIGHT / 2} L ${LINE_VB_WIDTH} ${LINE_VB_HEIGHT / 2}`;

/**
 * A horizontal timeline: line draws on first, then dots cascade in at each
 * anchor with the canonical stagger, then labels fade in beneath. The final
 * dot earns the dusty-rose accent — one focal moment, the rest neutral.
 *
 * @example
 * <Timeline points={[{ label: 'Concept' }, { label: 'Ship' }]} />
 */
export const Timeline: React.FC<TimelineProps> = ({
  points,
  delay,
  lineDuration,
  dotDelay,
  dotStagger,
  dotDuration,
  dotSize,
  lineColor,
  dotColor,
  accentColor,
  labelColor,
  fontSize,
  fontFamily,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-driven progress for the line draw. SPRING_SMOOTH lands the line
  // at full length and stays — no overshoot, no re-stroke flicker.
  const lineLocal = Math.max(0, frame - delay);
  const lineProgress = spring({
    frame: lineLocal,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: lineDuration,
  });
  const { strokeDasharray, strokeDashoffset } = evolvePath(lineProgress, LINE_PATH);

  // Anchor positions as percentages along the line. With N points the dots
  // sit at i/(N-1) — first at 0%, last at 100%. With a single point it sits
  // centered at 50% (avoids divide-by-zero, keeps the layout symmetric).
  const positionPct = (i: number): number => {
    if (points.length <= 1) return 50;
    return (i / (points.length - 1)) * 100;
  };

  const lastIndex = points.length - 1;

  return (
    <PlacementBox placement={placement}>
    <div
      style={{
        // Without an explicit width the flex column shrinks to its content
        // and the line/dot row collapses. 80% of canvas with a generous max
        // gives the timeline somewhere to live while keeping the edge margins
        // that the Onda layout language calls for.
        width: '80%',
        maxWidth: 1200,
        color: labelColor,
        fontFamily,
        fontSize,
        fontWeight: 500,
      }}
    >
      {/* The line layer. SVG stretches to the container width; the dots and
          labels are positioned absolutely on top so their geometry is in
          container coordinates, not SVG coordinates. */}
      <div style={{ position: 'relative', width: '100%', height: dotSize * 2 }}>
        <svg
          viewBox={`0 0 ${LINE_VB_WIDTH} ${LINE_VB_HEIGHT}`}
          preserveAspectRatio="none"
          width="100%"
          height={LINE_VB_HEIGHT}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            overflow: 'visible',
          }}
        >
          <path
            d={LINE_PATH}
            stroke={lineColor}
            strokeWidth={LINE_VB_HEIGHT}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Dots — entryScale per point with canonical stagger. */}
        {points.map((_, i) => {
          const thisDotDelay = delay + lineDuration + dotDelay + staggerFrames(i, dotStagger);
          const { opacity, transform } = entryScale({
            frame,
            fps,
            delay: thisDotDelay,
            durationInFrames: dotDuration,
          });
          const isLast = i === lastIndex;
          return (
            <div
              key={`dot-${i}`}
              style={{
                position: 'absolute',
                left: `${positionPct(i)}%`,
                top: '50%',
                width: dotSize,
                height: dotSize,
                marginLeft: -dotSize / 2,
                marginTop: -dotSize / 2,
                borderRadius: '50%',
                background: isLast ? accentColor : dotColor,
                opacity,
                transform,
              }}
            />
          );
        })}
      </div>

      {/* Label row. Each label fades in shortly after its dot — dot lands,
          label settles beneath. Labels share the row so vertical rhythm stays
          consistent regardless of point count. */}
      <div style={{ position: 'relative', width: '100%', marginTop: 20 }}>
        {points.map((p, i) => {
          const thisDotDelay = delay + lineDuration + dotDelay + staggerFrames(i, dotStagger);
          // Labels trail their dot by a couple frames — small lag so the dot
          // reads as the lead and the label as its consequence.
          const labelDelay = thisDotDelay + 2;
          const { opacity } = entryFade({
            frame,
            fps,
            delay: labelDelay,
            durationInFrames: dotDuration,
          });
          return (
            <div
              key={`label-${i}`}
              style={{
                position: 'absolute',
                left: `${positionPct(i)}%`,
                top: 0,
                transform: 'translateX(-50%)',
                opacity,
                color: labelColor,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
    </PlacementBox>
  );
};
