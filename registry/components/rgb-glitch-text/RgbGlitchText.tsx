import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { seededRandom } from '../../../lib/random';
import { rgbGlitchTextSchema, type RgbGlitchTextProps } from './schema';

export { rgbGlitchTextSchema, type RgbGlitchTextProps };

/**
 * RGB channel-split text — a red and a cyan copy ride just off the white
 * center, with periodic glitch bursts that kick the split wider. The burst
 * jitter is a pure function of a seeded PRNG keyed by the frame bucket, so it
 * renders identically every time (§1). High-energy by design; the baseline
 * split is restrained so the bursts read as punctuation.
 *
 * @example
 * <RgbGlitchText text="GLITCH" />
 */
export const RgbGlitchText: React.FC<RgbGlitchTextProps> = ({
  text, delay, baseSplit, intensity, glitchPeriod, glitchDuration, seed,
  color, redColor, cyanColor, fontSize, size, fontFamily, fontWeight, letterSpacing, align, placement,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const inBurst = local % glitchPeriod < glitchDuration;
  const bucket = Math.floor(local / 2);
  const rand = seededRandom(seed + bucket * 7919);
  const burst = inBurst ? rand() * 2 - 1 : 0;
  const dx = baseSplit + burst * intensity;
  const dy = inBurst ? (rand() * 2 - 1) * intensity * 0.4 : 0;

  const layer = (tint: string, ox: number, oy: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    color: tint,
    transform: `translate(${ox}px, ${oy}px)`,
    mixBlendMode: 'screen',
  });

  const base: React.CSSProperties = {
    fontFamily, fontSize: resolvedFontSize, fontWeight, letterSpacing, textAlign: align, whiteSpace: 'pre',
  };

  return (
    <PlacementBox placement={placement}>
      <div style={{ position: 'relative', ...base }}>
        <div style={layer(redColor, -dx, -dy)}>{text}</div>
        <div style={layer(cyanColor, dx, dy)}>{text}</div>
        <div style={{ position: 'relative', color }}>{text}</div>
      </div>
    </PlacementBox>
  );
};
