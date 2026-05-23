import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { FadeIn } from '../fade-in/FadeIn';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { Underline } from '../underline/Underline';
import { DURATION } from '../../../lib/motion';

/** Zod schema for {@link ChapterCard} props. */
export const chapterCardSchema = z.object({
  /** The chapter heading — the focal text on the card. */
  chapter: z.string().default('The setup'),
  /** Numbered index displayed above the chapter. String so leading zeros (`"01"`) read as intended. */
  number: z.string().default('01'),
  /** Frames before the number starts fading in. The whole card is sequenced relative to this. */
  delay: z.number().int().min(0).default(0),
  /** When `true`, the number renders in `numberColor` (the rose) and a quiet underline punctuates the title. */
  accent: z.boolean().default(true),
  /** Number color when `accent` is `true`. Defaults to `--onda-accent`. */
  numberColor: z.string().default('#D96B82'),
  /** Chapter title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Number color when `accent` is `false`. Defaults to `--onda-dim` so the number reads as quiet metadata. */
  subtitleColor: z.string().default('#8E8E98'),
  /** Number font size in px — smaller than the title, sitting above it. */
  numberFontSize: z.number().default(32),
  /** Chapter title font size in px — the focal element on the card. */
  titleFontSize: z.number().default(96),
  /** Onda display font. Applied to both number and title for tonal consistency. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link ChapterCard}. */
export type ChapterCardProps = z.infer<typeof chapterCardSchema>;

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
  titleFontSize,
  fontFamily,
}) => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize={numberFontSize}
        fontFamily={fontFamily}
      />

      {/* Chapter title — the focal element. BlurReveal's spring-driven rise +
          blur falloff is the canonical Onda entrance for headline text. */}
      <BlurReveal
        text={chapter}
        delay={delay + TITLE_OFFSET}
        duration={DURATION.base}
        color={color}
        fontSize={titleFontSize}
        fontFamily={fontFamily}
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
          fontSize={titleFontSize}
          fontFamily={fontFamily}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export default ChapterCard;
