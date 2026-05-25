import React from 'react';
import { useVideoConfig } from 'remotion';
import { FadeIn } from '../fade-in/FadeIn';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { Underline } from '../underline/Underline';
import { DURATION } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { chapterCardSchema, type ChapterCardProps } from './schema';

export { chapterCardSchema, type ChapterCardProps };

// Beat offsets — all derived from `delay` so the whole card is one composed
// sequence. The number lands first as a quiet eyebrow, the title rises 10
// frames later (canonical Onda follow-up cadence), and the accent underline
// punctuates the title as it settles.
const TITLE_OFFSET = 10;
const UNDERLINE_OFFSET = TITLE_OFFSET + 24;

/**
 * Chapter-card scene block: a numbered eyebrow ("01") fades in above a large
 * chapter title that rises with the canonical Onda blur-reveal. When `accent`
 * is on, the number takes the dusty rose and a quiet underline draws beneath
 * the title — one earned accent moment that ties the two beats together.
 *
 * Pure composition over `FadeIn`, `BlurReveal`, and `Underline` — this scene
 * block sequences existing primitives and never invents new motion.
 *
 * @example
 * <ChapterCard number="01" chapter="The setup" />
 */
export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  number,
  delay,
  accent,
  numberColor,
  color,
  subtitleColor,
  numberFontSize,
  numberSize,
  numberFontWeight,
  numberLetterSpacing,
  numberLineHeight,
  titleFontSize,
  titleSize,
  titleFontWeight,
  titleLetterSpacing,
  titleLineHeight,
  fontFamily,
  placement,
}) => {
  const { width, height } = useVideoConfig();
  const resolvedNumberFontSize = numberSize ? resolveSize(numberSize, { width, height }) : numberFontSize;
  const resolvedTitleFontSize = titleSize ? resolveSize(titleSize, { width, height }) : titleFontSize;
  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Numbered eyebrow — pure fade so the title (the next beat) owns the
            rise. When accent is on, the number takes the rose; otherwise it
            falls back to the dim metadata color. */}
        <FadeIn
          text={number}
          delay={delay}
          duration={DURATION.base}
          color={accent ? numberColor : subtitleColor}
          fontSize={resolvedNumberFontSize}
          fontFamily={fontFamily}
          fontWeight={numberFontWeight}
          letterSpacing={numberLetterSpacing}
          lineHeight={numberLineHeight}
        />

        {/* Chapter title — the focal element. BlurReveal's spring-driven rise +
            blur falloff is the canonical Onda entrance for headline text. */}
        <BlurReveal
          text={chapter}
          delay={delay + TITLE_OFFSET}
          duration={DURATION.base}
          color={color}
          fontSize={resolvedTitleFontSize}
          fontFamily={fontFamily}
          fontWeight={titleFontWeight}
          letterSpacing={titleLetterSpacing}
          lineHeight={titleLineHeight}
        />

        {/* Accent underline — only when accent is on, so the rose stays earned
            (one accent moment per scene). Empty text on the Underline primitive
            means only the rule draws — the BlurReveal above already owns the
            typography. */}
        {accent ? (
          <Underline
            text=""
            delay={delay + UNDERLINE_OFFSET}
            duration={1}
            lineDelay={0}
            lineDuration={DURATION.fast}
            color={color}
            accentColor={numberColor}
            lineThickness={3}
            lineOffset={0}
            fontSize={resolvedTitleFontSize}
            fontFamily={fontFamily}
          />
        ) : null}
      </div>
    </PlacementBox>
  );
};

export default ChapterCard;
