import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link Marquee} props. */
export const marqueeSchema = z.object({
  /** Items to scroll. The list is rendered three times for seamless wrap. */
  items: z.array(z.string()).default([
    'REMOTION',
    'TYPESCRIPT',
    'REACT',
  ]),
  /** Scroll speed in pixels per second. Keep low for restraint. */
  speed: z.number().default(30),
  /** Scroll direction. */
  direction: z.enum(['left', 'right']).default('left'),
  /** Pixels between items. */
  gap: z.number().int().min(0).default(64),
  /** Text color. Defaults to `--onda-faint` — atmospheric, not headline. */
  color: z.string().default('#56565F'),
  /** Pixels. */
  fontSize: z.number().default(32),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Marquee}. */
export type MarqueeProps = z.infer<typeof marqueeSchema>;

/**
 * A seamless looping horizontal scroll — logo strips, ticker tape,
 * "as featured in" rows. Slow and restrained on purpose.
 *
 * Intentionally **linear**: a marquee with spring acceleration would feel
 * broken.
 *
 * @example
 * <Marquee items={['REMOTION', 'TYPESCRIPT', 'REACT']} speed={30} />
 */
export const Marquee: React.FC<MarqueeProps> = ({
  items, speed, direction, gap, color, fontSize, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Linear translation by design. Marquees with spring acceleration feel
  // uneven and broken — alongside Typewriter and KenBurns, this is one of
  // the few Onda primitives that intentionally uses linear motion. See README.
  const elapsedSeconds = frame / fps;

  // Approximate width of one items set. We can't measure DOM width
  // deterministically without useState/useEffect, so we estimate using
  // 0.6 as an approximate average character width for proportional fonts.
  // The seam is invisible at restrained scroll speeds because we render the
  // items array three times in the row — there is always overlap.
  const oneSetWidth = items.reduce(
    (width, item) => width + item.length * fontSize * 0.6 + gap,
    0,
  );

  const rawOffset = elapsedSeconds * speed;
  // Modulo by one set's width so the wrap is seamless. JS `%` can return
  // negative values for negative operands, so guard with `+ oneSetWidth) %`.
  const wrapped = oneSetWidth > 0 ? ((rawOffset % oneSetWidth) + oneSetWidth) % oneSetWidth : 0;

  // 'left' moves content leftward, so translateX is negative.
  // 'right' moves rightward — negate to flip direction.
  const offset = direction === 'left' ? -wrapped : wrapped - oneSetWidth;

  // Render the items three times so there's always content covering the
  // viewport regardless of where the wrapped offset lands.
  const tripled = [...items, ...items, ...items];

  const fillCanvas = placement === undefined;

  const inner = (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: `${gap}px`,
          transform: `translateX(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {tripled.map((item, i) => (
          <span
            key={i}
            style={{
              color,
              fontSize,
              fontFamily,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  if (fillCanvas) {
    return inner;
  }

  return <PlacementBox placement={placement}>{inner}</PlacementBox>;
};
