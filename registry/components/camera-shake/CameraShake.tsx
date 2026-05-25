import React from 'react';
import { useCurrentFrame, random } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { cameraShakeSchema, type CameraShakeProps } from './schema';

export { cameraShakeSchema, type CameraShakeProps };

/**
 * Wraps children with a subtle, deterministic camera shake that decays to
 * rest. Driven by Remotion's seeded `random()` — same seed always produces
 * the same shake. No `Math.random` in the render path.
 *
 * @example
 * <CameraShake intensity={4} duration={24}>
 *   <MyScene />
 * </CameraShake>
 */
export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  delay,
  duration,
  intensity,
  seed,
  decay,
  placement,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;

  // Only shake while inside [delay, delay + duration]. Before/after, offset is 0
  // so wrapped content sits perfectly still — the shake is a contained event.
  let x = 0;
  let y = 0;

  if (local >= 0 && local <= duration) {
    const progress = duration > 0 ? local / duration : 1;
    // Decay linearly so the shake settles by the end. Restraint over time.
    const currentIntensity = decay ? intensity * (1 - progress) : intensity;

    // Remotion's seeded `random()` is deterministic across threads — same seed +
    // frame always yields the same offset. NEVER Math.random in a render.
    x = (random(seed + frame * 2) - 0.5) * 2 * currentIntensity;
    y = (random(seed + frame * 2 + 1) - 0.5) * 2 * currentIntensity;
  }

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          transform: `translate(${x}px, ${y}px)`,
          width: '100%',
          height: '100%',
        }}
      >
        {children ?? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F2F2F4',
              fontSize: 96,
              fontFamily: '"Clash Display", sans-serif',
              fontWeight: 600,
            }}
          >
            shake me
          </div>
        )}
      </div>
    </PlacementBox>
  );
};
