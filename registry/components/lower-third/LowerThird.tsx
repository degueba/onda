import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { SlideIn } from '../slide-in/SlideIn';
import { FadeIn } from '../fade-in/FadeIn';
import { Underline } from '../underline/Underline';
import { lowerThirdSchema } from './schema';

export { lowerThirdSchema };
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

// Scene block: composes SlideIn (name), FadeIn (role), and Underline (accent).
// No motion is reimplemented here — all timing comes from the primitives.
// The block's only job is positioning + offset choreography between them.
export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  position,
  delay,
  accent,
  color,
  roleColor,
  accentColor,
  fontSize,
  roleFontSize,
  fontFamily,
}) => {
  const isLeft = position === 'bottom-left';

  // Choreography offsets — frames *after* the name's delay.
  // Role follows the name by 4 frames (the canonical Onda stagger).
  // Underline lands last at +8 frames so the eye reads name -> role -> accent.
  const ROLE_OFFSET = 4;
  const UNDERLINE_OFFSET = 8;

  // SlideIn direction: from 'bottom-left' the name slides in from the left;
  // from 'bottom-right' it slides in from the right. Subtle horizontal travel
  // reinforces which corner the bar belongs to.
  const slideDirection = isLeft ? 'left' : 'right';

  return (
    <AbsoluteFill>
      {/* Position the lower-third 32px from the bottom and 32px from the
          chosen horizontal edge. Padding sits inside the bar so the name and
          role have breathing room without a visible chrome surface. */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: isLeft ? 32 : undefined,
          right: isLeft ? undefined : 32,
          padding: '16px 24px',
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
          fontSize={fontSize}
          fontFamily={fontFamily}
          distance={16}
          duration={18}
        />

        {/* Role — fades in 4 frames after the name. */}
        <FadeIn
          text={role}
          delay={delay + ROLE_OFFSET}
          color={roleColor}
          fontSize={roleFontSize}
          fontFamily={fontFamily}
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
              fontSize={fontSize}
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
    </AbsoluteFill>
  );
};

export default LowerThird;
