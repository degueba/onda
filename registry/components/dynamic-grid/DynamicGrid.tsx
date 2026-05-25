import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GridField, Glow } from '../../../lib/primitives';
import { dynamicGridSchema, type DynamicGridProps } from './schema';

export { dynamicGridSchema, type DynamicGridProps };

/**
 * A technical grid that drifts diagonally — the `GridField` primitive on a
 * frame-driven translate that loops by one cell, so it's seamless and
 * deterministic. Optional centered accent `Glow` lifts the middle. A
 * full-canvas atmosphere layer for dashboards / data / dev scenes.
 *
 * @example
 * <DynamicGrid variant="dots" />
 */
export const DynamicGrid: React.FC<DynamicGridProps> = ({
  cell, variant, color, speed, opacity, glow, glowColor, background,
}) => {
  const frame = useCurrentFrame();
  const offset = (frame * speed) % cell;

  return (
    <AbsoluteFill style={{ background, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: `-${cell}px`, transform: `translate(${-offset}px, ${-offset}px)` }}>
        <GridField cell={cell} variant={variant} color={color} opacity={opacity} />
      </div>
      {glow && <Glow color={glowColor} size={1} opacity={0.22} />}
    </AbsoluteFill>
  );
};
