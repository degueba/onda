import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Glow } from '../../../lib/primitives';
import { seededRandom } from '../../../lib/random';
import { nodeGraphSchema, type NodeGraphProps } from './schema';

export { nodeGraphSchema, type NodeGraphProps };

// House motion constants (CLAUDE.md §3) — smooth, settled, no overshoot.
const HOUSE_SPRING = { damping: 200, stiffness: 100, mass: 1 } as const;
const HOUSE_EASE = Easing.bezier(0.16, 1, 0.3, 1);
// Frames between sibling fly-ins (§3 stagger envelope, scaled to ~30fps feel).
const STAGGER = 4;
// How far off-frame a satellite starts before it flies into orbit.
const FLY_IN_DISTANCE = 1400;

/**
 * A hub-and-spoke constellation — a labeled central hub with satellite nodes
 * that fly in from off-frame, then settle into elliptical orbits at varying
 * radii and angular speeds. Connection lines hub→satellite periodically light
 * up. Everything is a pure function of `useCurrentFrame()` and a seed (§1), so
 * it renders deterministically and loops on the orbital periods.
 *
 * @example
 * <NodeGraph hubLabel="AI" />
 */
export const NodeGraph: React.FC<NodeGraphProps> = ({
  hubLabel,
  satellites,
  accent,
  ellipse,
  seed,
  delay,
  glow,
  hubDiameter,
  hubSize,
  hubFontSize,
  background,
  fontFamily,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const rand = seededRandom(seed);

  const resolvedHubFontSize = hubSize ? resolveSize(hubSize, { width, height }) : hubFontSize;

  // Hub entrance — a single calm scale-rise on the house spring.
  const hubP = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: HOUSE_SPRING,
    durationInFrames: 24,
  });
  const hubScale = interpolate(hubP, [0, 1], [0.7, 1]);
  const hubOpacity = interpolate(frame - delay, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });

  // Per-satellite deterministic motion. The seeded `rand()` draws are pulled
  // once per satellite in fixed order, so the sequence is stable every render.
  const nodes = satellites.map((sat, i) => {
    // Off-frame fly-in origin: a seeded direction, pushed out beyond the frame.
    const flyAngle = rand() * Math.PI * 2;
    const startX = Math.cos(flyAngle) * FLY_IN_DISTANCE;
    const startY = Math.sin(flyAngle) * FLY_IN_DISTANCE;
    // Connection-line pulse phase — seeded so siblings don't blink in unison.
    const pulsePhase = rand() * Math.PI * 2;

    const localDelay = delay + i * STAGGER;
    const t = frame - localDelay;

    // Settled orbital position (elliptical: y squashed by `ellipse`).
    const angle = sat.startAngle + sat.speed * Math.max(0, t);
    const orbitX = Math.cos(angle) * sat.radius;
    const orbitY = Math.sin(angle) * sat.radius * ellipse;

    // Fly-in blends start → orbit on the house spring (no overshoot).
    const p = spring({
      frame: Math.max(0, t),
      fps,
      config: HOUSE_SPRING,
      durationInFrames: 30,
    });
    const x = interpolate(p, [0, 1], [startX, orbitX]);
    const y = interpolate(p, [0, 1], [startY, orbitY]);

    const opacity = interpolate(t, [0, 16], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: HOUSE_EASE,
    });

    // Deterministic line "light-up": a slow sine, raised to a power so the
    // line sits dim most of the time and briefly flares. Gated by `p` so it
    // stays dark until the satellite has arrived.
    const wave = (Math.sin(t * 0.06 + pulsePhase) + 1) / 2; // 0..1
    const flare = Math.pow(wave, 4); // mostly low, brief peaks
    const lineLit = flare * p;

    return { sat, x, y, opacity, lineLit };
  });

  return (
    <AbsoluteFill style={{ background }}>
      <PlacementBox placement={placement ?? 'center'}>
        <div style={{ position: 'relative', width: 0, height: 0 }}>
          {/* Connection lines — SVG layer behind the nodes, centered on the hub. */}
          <svg
            width={width}
            height={height}
            viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            style={{
              position: 'absolute',
              left: -width / 2,
              top: -height / 2,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            {nodes.map(({ x, y, opacity, lineLit }, i) => (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke={accent}
                strokeWidth={interpolate(lineLit, [0, 1], [1, 2.4])}
                opacity={opacity * interpolate(lineLit, [0, 1], [0.12, 0.85])}
              />
            ))}
          </svg>

          {glow && (
            <div
              style={{
                position: 'absolute',
                left: -width / 2,
                top: -height / 2,
                width,
                height,
              }}
            >
              <Glow color={accent} size={0.7} opacity={0.22 * hubOpacity} />
            </div>
          )}

          {/* Satellite nodes. */}
          {nodes.map(({ sat, x, y, opacity }, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                opacity,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: 999,
                background: 'var(--onda-surface, #0E0E12)',
                border: '1px solid #1C1C22',
                boxShadow: '0 20px 40px -28px rgba(0,0,0,0.9)',
                color: 'var(--onda-text, #F2F2F4)',
                fontFamily,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {sat.label}
            </div>
          ))}

          {/* Central hub. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: hubDiameter,
              height: hubDiameter,
              transform: `translate(-50%, -50%) scale(${hubScale})`,
              opacity: hubOpacity,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 35%, ${accent}, #0E0E12 78%)`,
              border: `1px solid ${accent}`,
              boxShadow: `0 0 60px -10px ${accent}, 0 30px 60px -34px rgba(0,0,0,0.9)`,
              color: 'var(--onda-text, #F2F2F4)',
              fontFamily,
              fontSize: resolvedHubFontSize,
              fontWeight: 600,
              letterSpacing: '-0.03em',
            }}
          >
            {hubLabel}
          </div>
        </div>
      </PlacementBox>
    </AbsoluteFill>
  );
};

export default NodeGraph;
