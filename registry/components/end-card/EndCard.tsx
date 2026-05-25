import React from 'react';
import { useVideoConfig } from 'remotion';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { StaggerGroup } from '../stagger-group/StaggerGroup';
import { Underline } from '../underline/Underline';
import { DURATION, STAGGER } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { endCardSchema, type EndCardProps } from './schema';

export { endCardSchema, type EndCardProps };

// Beat offsets — all derived from delay so the whole card is one composed
// sequence. The CTA lands first, the underline draws as it settles, and the
// handles row fades in last so the eye finishes on the social/URL strip.
const HANDLES_OFFSET = DURATION.base + 6;   // handles begin ~6 frames after the CTA finishes its rise
const UNDERLINE_OFFSET = DURATION.base - 4; // underline starts drawing just as the CTA settles

/**
 * Closing scene block: a hero CTA reveals with an optional accent underline,
 * then a faint, staggered row of social handles or URLs fades in beneath it.
 *
 * Composes `BlurReveal`, `Underline`, and `StaggerGroup` so the motion
 * fingerprint stays consistent with the rest of the catalog.
 *
 * @example
 * <EndCard cta="Made with Onda" handles={['@onda.video']} />
 */
export const EndCard: React.FC<EndCardProps> = ({
  cta,
  handles,
  delay,
  accent,
  ctaFontSize,
  ctaSize,
  ctaFontWeight,
  ctaLetterSpacing,
  ctaLineHeight,
  handlesFontSize,
  handlesSize,
  handlesFontWeight,
  handlesLetterSpacing,
  handlesLineHeight,
  color,
  handlesColor,
  accentColor,
  fontFamily,
  placement,
}) => {
  const { width, height } = useVideoConfig();
  const resolvedCtaFontSize = ctaSize ? resolveSize(ctaSize, { width, height }) : ctaFontSize;
  const resolvedHandlesFontSize = handlesSize ? resolveSize(handlesSize, { width, height }) : handlesFontSize;
  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* CTA — composed BlurReveal, optionally followed by the accent underline. */}
        {accent ? (
          // Underline already renders the text + the accent line as a two-phase
          // reveal, so when accent is on we delegate the headline to it. This
          // keeps the underline visually attached to the CTA glyphs (which the
          // Underline primitive measures) instead of stacking a separate line
          // below a separately-revealed BlurReveal — composition over duplication.
          <Underline kind="underline"
            text={cta}
            delay={delay}
            duration={DURATION.base}
            lineDelay={UNDERLINE_OFFSET}
            lineDuration={DURATION.fast}
            color={color}
            accentColor={accentColor}
            fontSize={resolvedCtaFontSize}
            fontFamily={fontFamily}
            fontWeight={ctaFontWeight}
            letterSpacing={ctaLetterSpacing}
            lineHeight={ctaLineHeight}
            lineThickness={3}
            lineOffset={6}
          />
        ) : (
          <BlurReveal kind="blur-reveal"
            text={cta}
            delay={delay}
            duration={DURATION.base}
            color={color}
            fontSize={resolvedCtaFontSize}
            fontFamily={fontFamily}
            fontWeight={ctaFontWeight}
            letterSpacing={ctaLetterSpacing}
            lineHeight={ctaLineHeight}
          />
        )}

        {/* Handles row — staggered, faint, the closing beat. Rendered horizontally
            so URLs and social handles read as a single strip of metadata, not a
            stack. The dot separators are part of the items themselves so the
            stagger fingerprint stays consistent (each handle is one beat). */}
        <StaggerGroup kind="stagger-group"
          items={handles}
          delay={delay + HANDLES_OFFSET}
          duration={DURATION.base}
          stagger={STAGGER}
          direction="row"
          gap={32}
          align="center"
          color={handlesColor}
          fontSize={resolvedHandlesFontSize}
          fontFamily={fontFamily}
          fontWeight={handlesFontWeight}
          letterSpacing={handlesLetterSpacing}
          lineHeight={handlesLineHeight}
        />
      </div>
    </PlacementBox>
  );
};
