import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { marqueeSchema, type MarqueeProps } from './schema';

export { marqueeSchema, type MarqueeProps };

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
