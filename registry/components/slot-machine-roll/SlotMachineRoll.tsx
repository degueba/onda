import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { seededRandom } from '../../../lib/random';
import { slotMachineRollSchema, type SlotMachineRollProps } from './schema';

export { slotMachineRollSchema, type SlotMachineRollProps };

/**
 * Each character spins down a reel of glyphs and lands on its target, settling
 * on the house spring — staggered left-to-right. The filler glyphs are seeded
 * (deterministic), so the spin is identical every render (§1). Best on short
 * numeric strings (years, counts, prices); defaults to a monospace stack so
 * the reels stay column-aligned.
 *
 * @example
 * <SlotMachineRoll text="2026" />
 */
export const SlotMachineRoll: React.FC<SlotMachineRollProps> = ({
  text, delay, charDelay, duration, reelLength, seed, charset,
  color, fontSize, size, fontFamily, fontWeight, letterSpacing, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = frame - delay;
  const cell = size ? resolveSize(size, { width, height }) : fontSize;
  const chars = text.split('');

  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'flex', justifyContent: justify, fontFamily, fontWeight, letterSpacing, color }}>
        {chars.map((ch, i) => {
          if (ch === ' ') return <span key={i} style={{ width: cell * 0.4 }} />;

          const rand = seededRandom(seed + i * 7919);
          const reel: string[] = [];
          for (let k = 0; k < reelLength; k++) reel.push(charset[Math.floor(rand() * charset.length)] ?? ch);
          reel.push(ch);

          const p = spring({ frame: local - i * charDelay, fps, config: SPRING_SMOOTH, durationInFrames: duration });
          const ty = interpolate(p, [0, 1], [-reelLength * cell, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <span key={i} style={{ display: 'inline-block', height: cell, lineHeight: `${cell}px`, fontSize: cell, overflow: 'hidden', verticalAlign: 'top' }}>
              <span style={{ display: 'block', transform: `translateY(${ty}px)` }}>
                {reel.map((g, k) => (
                  <span key={k} style={{ display: 'block', height: cell, lineHeight: `${cell}px` }}>{g}</span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </PlacementBox>
  );
};
