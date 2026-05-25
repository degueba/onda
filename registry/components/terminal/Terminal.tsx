import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useTextReveal, useStaggeredEntrance } from '../../../lib/hooks';
import { terminalSchema, type TerminalProps } from './schema';

export { terminalSchema, type TerminalProps };

/**
 * A terminal session: the command types itself after the prompt, a block
 * cursor blinks while typing, then the output lines appear staggered. Built
 * on the glass `Surface`. Calm, deterministic — the cursor blink is keyed off
 * the frame, not a timer.
 *
 * @example
 * <Terminal command="npm run render" output={['done in 4.2s']} />
 */
export const Terminal: React.FC<TerminalProps> = ({
  command, output, prompt, title, chrome, delay, typeSpeed, outputDelay,
  fontFamily, fontSize, width, textColor, promptColor, outputColor, placement,
}) => {
  const frame = useCurrentFrame();
  const shown = useTextReveal({ length: command.length, delay, durationInFrames: typeSpeed });
  const typing = shown < command.length;
  const blinkOn = Math.floor(frame / 15) % 2 === 0;
  const outputAt = useStaggeredEntrance({
    type: 'fade',
    delay: delay + typeSpeed + outputDelay,
    increment: 4,
  });

  return (
    <PlacementBox placement={placement}>
      <Surface variant="glass" width={width} padding={0}>
        {chrome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #1C1C22' }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            {title && <span style={{ marginLeft: 10, color: '#56565F', fontFamily, fontSize: fontSize * 0.62, letterSpacing: '0.04em' }}>{title}</span>}
          </div>
        )}
        <div style={{ padding: '28px 36px', fontFamily, fontSize, lineHeight: 1.6 }}>
          <div style={{ whiteSpace: 'pre', color: textColor }}>
            <span style={{ color: promptColor, marginRight: 10 }}>{prompt}</span>
            {command.slice(0, shown)}
            {typing && blinkOn && <span style={{ background: textColor, color: textColor }}>▍</span>}
          </div>
          {output.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre', color: outputColor, opacity: outputAt(i).opacity }}>
              {line}
            </div>
          ))}
        </div>
      </Surface>
    </PlacementBox>
  );
};
