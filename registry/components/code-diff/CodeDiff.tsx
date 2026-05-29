import React from 'react';
import { PlacementBox } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useStaggeredEntrance } from '../../../lib/hooks';
import { codeDiffSchema, type CodeDiffProps } from './schema';

export { codeDiffSchema, type CodeDiffProps };

/**
 * A unified code diff on the Onda glass surface, revealed line-by-line.
 * Added / removed lines carry a colored left border + gutter symbol (`+`/`−`);
 * context lines stay neutral. Diff green/red is the one place Onda departs
 * from the monochrome-plus-rose palette — the colors are semantic and
 * universal, and they're props if you want to retune them.
 *
 * @example
 * <CodeDiff lines={[{ text: 'old', type: 'remove' }, { text: 'new', type: 'add' }]} />
 */
export const CodeDiff: React.FC<CodeDiffProps> = ({
  lines, title, chrome, revealLines, delay, lineDelay,
  fontFamily, fontSize, width, textColor, addColor, removeColor, placement,
}) => {
  const lineStyleAt = useStaggeredEntrance({ type: 'rise', delay, increment: lineDelay, distance: 6 });

  const colorFor = (t: string) => (t === 'add' ? addColor : t === 'remove' ? removeColor : textColor);
  const gutterFor = (t: string) => (t === 'add' ? '+' : t === 'remove' ? '−' : ' ');

  return (
    <PlacementBox placement={placement}>
      <Surface variant="glass" width={width} padding={0}>
        {chrome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #1C1C22' }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--onda-border-lit, #26262E)' }} />
            {title && <span style={{ marginLeft: 10, color: 'var(--onda-faint, #56565F)', fontFamily, fontSize: fontSize * 0.6, letterSpacing: '0.04em' }}>{title}</span>}
          </div>
        )}
        <div style={{ padding: '24px 0', fontFamily, fontSize, lineHeight: 1.6 }}>
          {lines.map((line, i) => {
            const s = revealLines ? lineStyleAt(i) : { opacity: 1, transform: 'none' };
            const c = colorFor(line.type);
            const tinted = line.type !== 'context';
            return (
              <div
                key={i}
                style={{
                  opacity: s.opacity,
                  transform: s.transform,
                  display: 'flex',
                  whiteSpace: 'pre',
                  color: c,
                  padding: '0 28px 0 18px',
                  borderLeft: `4px solid ${tinted ? c : 'transparent'}`,
                  background: tinted ? `${c}14` : 'transparent',
                }}
              >
                <span style={{ width: '1.4em', opacity: 0.8 }}>{gutterFor(line.type)}</span>
                <span>{line.text}</span>
              </div>
            );
          })}
        </div>
      </Surface>
    </PlacementBox>
  );
};
