import React from 'react';
import { z } from 'zod';
import { SlideIn } from '../slide-in/SlideIn';
import { FadeIn } from '../fade-in/FadeIn';
import { Underline } from '../underline/Underline';
import { useVideoConfig } from 'remotion';
import { PlacementBox, resolvePlacement, resolveSize } from '../../../lib/canvas';
import { lowerThirdSchema } from './schema';

export { lowerThirdSchema };
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

/**
 * Broadcast-style name + role bar that slides in from a corner with a single
 * accent underline. A restrained scene block composed from `SlideIn`,
 * `FadeIn`, and `Underline` — no chrome, no glow, one earned accent.
 *
 * The slide direction and inner alignment derive from `placement` — a bar
 * placed on the right slides in from the right and aligns flush right.
 *
 * @example
 * <LowerThird name="Rodrigo" role="CEO, Onda" placement="bottom-right" />
 */
export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  placement,
  delay,
  accent,
  color,
  roleColor,
  accentColor,
  fontSize,
  nameSize,
  nameFontWeight,
  nameLetterSpacing,
  nameLineHeight,
  roleFontSize,
  roleSize,
  roleFontWeight,
  roleLetterSpacing,
  roleLineHeight,
  fontFamily,
}) => {
  const { width, height } = useVideoConfig();
  const resolvedNameFontSize = nameSize ? resolveSize(nameSize, { width, height }) : fontSize;
  const resolvedRoleFontSize = roleSize ? resolveSize(roleSize, { width, height }) : roleFontSize;
  // Derive the visual side from the resolved placement's x coordinate. A bar
  // on the left half slides in from the left and aligns flush-left; on the
  // right half it mirrors. Anchor-flush via PlacementBox handles the rest.
  const isLeft = resolvePlacement(placement).x < 0.5;

  // Choreography offsets — frames *after* the name's delay.
  // Role follows the name by 4 frames (the canonical Onda stagger).
  // Underline lands last at +8 frames so the eye reads name -> role -> accent.
  const ROLE_OFFSET = 4;
  const UNDERLINE_OFFSET = 8;

  // SlideIn direction matches the side the bar sits on — subtle horizontal
  // travel reinforces which corner the bar belongs to.
  const slideDirection = isLeft ? 'left' : 'right';

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isLeft ? 'flex-start' : 'flex-end',
          gap: 4,
          fontFamily,
        }}
      >
        {/* Name — slides in from the side. Uses the primitive's own spring. */}
        <SlideIn
          text={name}
          delay={delay}
          direction={slideDirection}
          color={color}
          fontSize={resolvedNameFontSize}
          fontFamily={fontFamily}
          fontWeight={nameFontWeight}
          letterSpacing={nameLetterSpacing}
          lineHeight={nameLineHeight}
          distance={16}
          duration={18}
        />

        {/* Role — fades in 4 frames after the name. */}
        <FadeIn
          text={role}
          delay={delay + ROLE_OFFSET}
          color={roleColor}
          fontSize={resolvedRoleFontSize}
          fontFamily={fontFamily}
          fontWeight={roleFontWeight}
          letterSpacing={roleLetterSpacing}
          lineHeight={roleLineHeight}
          duration={18}
        />

        {/* Accent underline — appears last, only when accent === true.
            The Underline primitive draws its own line; we pass an empty
            string for text so only the accent rule is visible (the name
            above already owns the typography). */}
        {accent ? (
          <div
            style={{
              marginTop: 8,
              alignSelf: isLeft ? 'flex-start' : 'flex-end',
            }}
          >
            <Underline
              text=""
              delay={delay + UNDERLINE_OFFSET}
              color={color}
              accentColor={accentColor}
              fontSize={resolvedNameFontSize}
              fontFamily={fontFamily}
              duration={1}
              lineDelay={0}
              lineThickness={3}
              lineOffset={0}
              lineDuration={10}
            />
          </div>
        ) : null}
      </div>
    </PlacementBox>
  );
};

export default LowerThird;
