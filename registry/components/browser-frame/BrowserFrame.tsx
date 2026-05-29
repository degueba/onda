import React from 'react';
import { PlacementBox } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useEntrance } from '../../../lib/hooks';
import { browserFrameSchema, type BrowserFrameProps } from './schema';

export { browserFrameSchema, type BrowserFrameProps };

/**
 * A browser chrome that wraps arbitrary content — pass `children` (JSX), an
 * image `src`, or neither (a neutral placeholder). A container, not a leaf:
 * the documented exception to "self-contained" since wrapping is its whole
 * job. Scales-and-fades in on the house spring.
 *
 * @example
 * <BrowserFrame url="onda.video"><MyScene /></BrowserFrame>
 */
export const BrowserFrame: React.FC<BrowserFrameProps & { children?: React.ReactNode }> = ({
  url, src, delay, animate, width, height, placement, children,
}) => {
  const entrance = useEntrance({ type: 'scale', delay, from: 0.96 });
  const style = animate ? entrance : { opacity: 1, transform: 'none' };

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: style.opacity, transform: style.transform }}>
        <Surface variant="card" width={width} padding={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid #1C1C22' }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            <div
              style={{
                marginLeft: 16, flex: 1, height: 40, borderRadius: 999,
                background: 'var(--onda-surface-2, #121217)', border: '1px solid #1C1C22',
                display: 'flex', alignItems: 'center', padding: '0 20px',
                color: 'var(--onda-dim, #8E8E98)', fontFamily: 'var(--onda-font-body, "Space Grotesk", sans-serif)', fontSize: 22, letterSpacing: '0.02em',
              }}
            >
              {url}
            </div>
          </div>
          <div style={{ width, height, overflow: 'hidden', background: 'var(--onda-bg, #08080A)' }}>
            {children ??
              (src ? (
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--onda-faint, #56565F)', fontFamily: 'var(--onda-font-body, "Space Grotesk", sans-serif)', fontSize: 32 }}>
                  {url}
                </div>
              ))}
          </div>
        </Surface>
      </div>
    </PlacementBox>
  );
};
