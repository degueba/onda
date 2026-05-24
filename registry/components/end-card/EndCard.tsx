import React from 'react';
import { useVideoConfig } from 'remotion';
import { z } from 'zod';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { StaggerGroup } from '../stagger-group/StaggerGroup';
import { Underline } from '../underline/Underline';
import { DURATION, STAGGER } from '../../../lib/motion';
import { PlacementBox, placementSchema, sizeRoleSchema, resolveSize } from '../../../lib/canvas';

/** Zod schema for {@link EndCard} props. */
export const endCardSchema = z.object({
  /** Hero CTA line. */
  cta: z.string().default('Made with Onda'),
  /** Social handles or URLs displayed in a row beneath the CTA. */
  handles: z.array(z.string()).default(['@onda.video', 'onda.video/components']),
  /** Frames before the CTA starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the CTA. */
  accent: z.boolean().default(true),
  /** CTA font size in px. Wins over `ctaSize` if both are passed. */
  ctaFontSize: z.number().default(96),
  /** Semantic role for the CTA — resolves to canvas-aware pixels. `ctaFontSize` wins when both are passed. */
  ctaSize: sizeRoleSchema.optional(),
  /** Font weight for the CTA. */
  ctaFontWeight: z.number().optional(),
  /** CSS letter-spacing for the CTA (e.g. `'-0.02em'`). */
  ctaLetterSpacing: z.string().optional(),
  /** Unitless line height for the CTA. */
  ctaLineHeight: z.number().optional(),
  /** Handles row font size in px. Wins over `handlesSize` if both are passed. */
  handlesFontSize: z.number().default(24),
  /** Semantic role for the handles row — resolves to canvas-aware pixels. `handlesFontSize` wins when both are passed. */
  handlesSize: sizeRoleSchema.optional(),
  /** Font weight for the handles row. */
  handlesFontWeight: z.number().optional(),
  /** CSS letter-spacing for the handles row (e.g. `'0.06em'`). */
  handlesLetterSpacing: z.string().optional(),
  /** Unitless line height for the handles row. */
  handlesLineHeight: z.number().optional(),
  /** CTA color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Handles color. Defaults to `--onda-faint`. */
  handlesColor: z.string().default('#56565F'),
  /** Underline color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link EndCard}. */
export type EndCardProps = z.infer<typeof endCardSchema>;

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
          <Underline
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
          <BlurReveal
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
        <StaggerGroup
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
