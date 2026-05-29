import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useTextReveal } from '../../../lib/hooks';
import { inputFieldSchema, type InputFieldProps } from './schema';

export { inputFieldSchema, type InputFieldProps };

/**
 * A UI text input field on the Onda glass surface: an optional label sits above
 * a rounded glass field. With `typed` on, the `value` types itself in character
 * by character (via `useTextReveal`) behind a blinking caret; otherwise the
 * value (or placeholder) shows statically. The caret blink and the focus ring
 * are keyed off `useCurrentFrame()`, so the whole field is deterministic
 * (CLAUDE.md §1). The caret and ring carry the one earned accent.
 *
 * @example
 * <InputField label="Email" value="hello@onda.video" placement="center" />
 */
export const InputField: React.FC<InputFieldProps> = ({
  value, placeholder, label, typed, delay, typeDuration, focusRing, width,
  fontSize, size, fontFamily, textColor, placeholderColor, labelColor,
  accentColor, placement,
}) => {
  const frame = useCurrentFrame();
  const { width: canvasW, height: canvasH } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width: canvasW, height: canvasH }) : fontSize;

  // How much of the value is visible. With typing off, the whole value shows.
  const shown = useTextReveal({ length: value.length, delay, durationInFrames: typeDuration });
  const visible = typed ? value.slice(0, shown) : value;
  const typing = typed && shown < value.length;

  // Caret blinks while typing (faster, tracking each keystroke) and after it
  // settles (slower, an idle cursor). Pure frame math — no timer.
  const blinkOn = typing
    ? Math.floor(frame / 8) % 2 === 0
    : Math.floor(frame / 18) % 2 === 0;
  const showCaret = typed && blinkOn;

  // Focus ring only reads as "focused" once typing is underway / done.
  const focused = focusRing && (!typed || frame >= delay);

  const showPlaceholder = visible.length === 0 && !showCaret;

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width }}>
        {label && (
          <span
            style={{
              fontFamily,
              fontSize: resolvedFontSize * 0.52,
              color: labelColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        )}
        <Surface
          variant="glass"
          width={width}
          padding={0}
          borderColor={focused ? accentColor : 'var(--onda-border, #1C1C22)'}
        >
          <div
            style={{
              position: 'relative',
              padding: '22px 28px',
              display: 'flex',
              alignItems: 'center',
              fontFamily,
              fontSize: resolvedFontSize,
              lineHeight: 1.2,
              minHeight: resolvedFontSize * 1.2,
            }}
          >
            {/* Accent focus ring — a soft glow inside the field border. */}
            {focused && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  boxShadow: `0 0 0 3px ${accentColor}33`,
                  pointerEvents: 'none',
                }}
              />
            )}
            <span style={{ color: textColor, whiteSpace: 'pre' }}>{visible}</span>
            {showCaret && (
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: Math.max(2, resolvedFontSize * 0.06),
                  height: resolvedFontSize,
                  marginLeft: 2,
                  background: accentColor,
                  verticalAlign: 'middle',
                }}
              />
            )}
            {showPlaceholder && (
              <span style={{ color: placeholderColor, whiteSpace: 'pre' }}>{placeholder}</span>
            )}
          </div>
        </Surface>
      </div>
    </PlacementBox>
  );
};

export default InputField;
