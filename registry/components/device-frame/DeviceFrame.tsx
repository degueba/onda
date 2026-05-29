import React from 'react';
import { PlacementBox } from '../../../lib/canvas';
import { useEntrance } from '../../../lib/hooks';
import { deviceFrameSchema, type DeviceFrameProps } from './schema';

export { deviceFrameSchema, type DeviceFrameProps };

const SHADOW = '0 50px 90px -40px rgba(0,0,0,0.95)';
const BEZEL = 'var(--onda-border, #1C1C22)';
const SCREEN_BG = 'var(--onda-bg, #08080A)';

function Screen({ src, children, radius }: { src?: string; children?: React.ReactNode; radius: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', background: SCREEN_BG }}>
      {children ??
        (src ? (
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : null)}
    </div>
  );
}

/**
 * A phone or laptop bezel that wraps arbitrary content — pass `children` (JSX),
 * an image `src`, or neither. A container (the documented exception to
 * "self-contained"); scales-and-fades in on the house spring.
 *
 * @example
 * <DeviceFrame device="phone"><MyScene /></DeviceFrame>
 */
export const DeviceFrame: React.FC<DeviceFrameProps & { children?: React.ReactNode }> = ({
  device, src, delay, animate, width, placement, children,
}) => {
  const entrance = useEntrance({ type: 'scale', delay, from: 0.96 });
  const style = animate ? entrance : { opacity: 1, transform: 'none' };

  let body: React.ReactNode;
  if (device === 'phone') {
    const radius = width * 0.15;
    const bezel = Math.max(12, width * 0.035);
    body = (
      <div style={{ width, height: width * 2.05, borderRadius: radius, background: BEZEL, padding: bezel, boxShadow: SHADOW, position: 'relative' }}>
        {/* notch */}
        <div style={{ position: 'absolute', top: bezel + 6, left: '50%', transform: 'translateX(-50%)', width: width * 0.32, height: 10, borderRadius: 999, background: '#000', zIndex: 2 }} />
        <Screen src={src} radius={radius - bezel}>{children}</Screen>
      </div>
    );
  } else {
    const screenH = width * 0.62;
    const bezel = Math.max(10, width * 0.02);
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width, height: screenH, borderRadius: 16, background: BEZEL, padding: bezel, boxShadow: SHADOW }}>
          <Screen src={src} radius={16 - bezel}>{children}</Screen>
        </div>
        {/* base / hinge */}
        <div style={{ width: width * 1.16, height: 14, background: 'var(--onda-border-lit, #26262E)', borderRadius: '0 0 14px 14px' }} />
        <div style={{ width: width * 0.16, height: 6, background: 'var(--onda-border, #1C1C22)', borderRadius: '0 0 8px 8px' }} />
      </div>
    );
  }

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: style.opacity, transform: style.transform }}>{body}</div>
    </PlacementBox>
  );
};
