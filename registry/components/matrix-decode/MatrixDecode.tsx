import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { seededRandom } from '../../../lib/random';
import { matrixDecodeSchema, type MatrixDecodeProps } from './schema';

export { matrixDecodeSchema, type MatrixDecodeProps };

/**
 * Each character flickers through random glyphs, then settles to its target
 * left-to-right — a decode reveal. The flicker is deterministic (glyph picks
 * come from a seeded PRNG keyed by char index + frame bucket), so it renders
 * identically every time (§1). Scrambling glyphs carry the accent; settled
 * text goes neutral.
 *
 * @example
 * <MatrixDecode text="ONDA" />
 */
export const MatrixDecode: React.FC<MatrixDecodeProps> = ({
  text, delay, charDelay, scrambleDuration, scrambleSpeed, seed, charset,
  color, scrambleColor, fontSize, size, fontFamily, fontWeight, letterSpacing, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const local = frame - delay;
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const chars = text.split('');

  return (
    <PlacementBox placement={placement}>
      <div style={{ fontFamily, fontSize: resolvedFontSize, fontWeight, letterSpacing, textAlign: align, whiteSpace: 'pre' }}>
        {chars.map((ch, i) => {
          if (ch === ' ') return <span key={i}> </span>;
          const settleAt = i * charDelay + scrambleDuration;
          const settled = local >= settleAt;
          if (settled) {
            return <span key={i} style={{ color }}>{ch}</span>;
          }
          // Scramble: pick a glyph deterministically from (index, frame bucket).
          const bucket = Math.floor(Math.max(0, local) / scrambleSpeed);
          const rand = seededRandom(seed + i * 9301 + bucket * 49297);
          const glyph = charset[Math.floor(rand() * charset.length)] ?? ch;
          return <span key={i} style={{ color: scrambleColor }}>{glyph}</span>;
        })}
      </div>
    </PlacementBox>
  );
};
