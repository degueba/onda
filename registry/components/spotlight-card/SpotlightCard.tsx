import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { Surface, Glow } from '../../../lib/primitives';
import { useEntrance } from '../../../lib/hooks';
import { spotlightCardSchema, type SpotlightCardProps } from './schema';

export { spotlightCardSchema, type SpotlightCardProps };

/**
 * A glass card with a spotlight that drifts slowly behind the content —
 * `Surface` + a frame-driven `Glow`. The card rises in on the house spring;
 * the spotlight keeps moving so the surface feels alive without anything
 * competing for attention.
 *
 * @example
 * <SpotlightCard title="Motion identity" />
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  eyebrow, title, body, delay, glowColor, width, padding, align, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const entrance = useEntrance({ type: 'rise', delay });
  const gx = 0.5 + Math.sin(frame * 0.02) * 0.22;
  const gy = 0.4 + Math.cos(frame * 0.016) * 0.16;

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: entrance.opacity, transform: entrance.transform }}>
        <Surface variant="glass" width={width} padding={padding}>
          <Glow color={glowColor} size={0.9} x={gx} y={gy} opacity={0.28} />
          <div style={{ position: 'relative', textAlign: align }}>
            {eyebrow && (
              <div style={{ color: 'var(--onda-faint, #56565F)', fontFamily: 'var(--onda-font-body, "Space Grotesk", sans-serif)', fontSize: 15, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>
                {eyebrow}
              </div>
            )}
            <div style={{ color: 'var(--onda-text, #F2F2F4)', fontFamily, fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {title}
            </div>
            {body && (
              <div style={{ color: 'var(--onda-dim, #8E8E98)', fontFamily: 'var(--onda-font-body, "Space Grotesk", sans-serif)', fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>
                {body}
              </div>
            )}
          </div>
        </Surface>
      </div>
    </PlacementBox>
  );
};
