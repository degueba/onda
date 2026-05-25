import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { HOUSE_EASE } from '../../../lib/easing';
import { textFadeReplaceSchema, type TextFadeReplaceProps } from './schema';

export { textFadeReplaceSchema, type TextFadeReplaceProps };

/**
 * Cycles through a list of phrases, crossfading one into the next in place.
 * Both the outgoing and incoming phrase are layered so the swap never shifts
 * the layout. Calm `HOUSE_EASE` crossfade — for rotating taglines / value
 * props.
 *
 * @example
 * <TextFadeReplace phrases={['ship', 'render', 'repeat']} />
 */
export const TextFadeReplace: React.FC<TextFadeReplaceProps> = ({
  phrases, interval, crossfade, delay, loop, color,
  fontSize, size, fontFamily, fontWeight, letterSpacing, lineHeight, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const total = phrases.length;
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const slot = Math.floor(local / interval);
  const idx = loop ? ((slot % total) + total) % total : Math.min(slot, total - 1);
  const nextIdx = loop ? (idx + 1) % total : Math.min(slot + 1, total - 1);

  const into = local - slot * interval;
  const fadeStart = interval - crossfade;
  const swapping = into >= fadeStart && (loop || slot < total - 1);
  const p = swapping
    ? interpolate(into, [fadeStart, interval], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: HOUSE_EASE,
      })
    : 0;

  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    color, fontSize: resolvedFontSize, fontFamily, fontWeight, letterSpacing, lineHeight, textAlign: align,
    whiteSpace: 'nowrap',
  };

  return (
    <PlacementBox placement={placement}>
      <div style={{ position: 'relative', display: 'flex', justifyContent: justify }}>
        {/* reserve height so the layout is stable */}
        <span style={{ opacity: 0, fontSize: resolvedFontSize, fontFamily, fontWeight, lineHeight }}>{phrases[idx]}</span>
        <span style={{ ...textStyle, opacity: 1 - p }}>{phrases[idx]}</span>
        {swapping && <span style={{ ...textStyle, opacity: p }}>{phrases[nextIdx]}</span>}
      </div>
    </PlacementBox>
  );
};
