import React from 'react';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { useVideoConfig } from 'remotion';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { WordStagger } from '../word-stagger/WordStagger';
import { Underline } from '../underline/Underline';
import { titleCardSchema, type TitleCardProps } from './schema';

export { titleCardSchema, type TitleCardProps };

// Internal sequencing constants — staggered offsets between the composed
// children. Tuned so the title lands first, the subtitle reads as a calm
// follow-up, and the underline arrives last as a quiet punctuation.
const SUBTITLE_OFFSET = 24; // frames after title start — title has landed
const UNDERLINE_OFFSET = 40; // frames after title start — subtitle is reading

/**
 * Hero title-card scene block: a large headline reveals with a calm
 * blur-and-rise, a subtitle cascades word-by-word beneath it, and an optional
 * accent underline arrives last as quiet punctuation.
 *
 * Composes `BlurReveal` / `Underline` and `WordStagger` — no new motion of
 * its own.
 *
 * @example
 * <TitleCard title="Onda" subtitle="motion graphics for Remotion" />
 */
export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  delay,
  accent,
  titleFontSize,
  titleSize,
  titleFontWeight,
  titleLetterSpacing,
  titleLineHeight,
  subtitleFontSize,
  subtitleSize,
  subtitleFontWeight,
  subtitleLetterSpacing,
  subtitleLineHeight,
  color,
  subtitleColor,
  accentColor,
  fontFamily,
  placement,
}) => {
  const { width, height } = useVideoConfig();
  const resolvedTitleFontSize = titleSize ? resolveSize(titleSize, { width, height }) : titleFontSize;
  const resolvedSubtitleFontSize = subtitleSize ? resolveSize(subtitleSize, { width, height }) : subtitleFontSize;
  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {accent ? (
          // When the accent underline is enabled, the title is rendered by
          // Underline (which owns both the text fade and the rule). The
          // primitive's defaults already match Onda's blur-reveal feel via the
          // shared SPRING_SMOOTH / entryFade — no need to re-blur on top.
          <Underline kind="underline"
            text={title}
            delay={delay}
            duration={18}
            lineDelay={UNDERLINE_OFFSET}
            lineDuration={10}
            color={color}
            accentColor={accentColor}
            lineThickness={4}
            lineOffset={12}
            fontSize={resolvedTitleFontSize}
            fontFamily={fontFamily}
            fontWeight={titleFontWeight}
            letterSpacing={titleLetterSpacing}
            lineHeight={titleLineHeight}
          />
        ) : (
          <BlurReveal kind="blur-reveal"
            text={title}
            delay={delay}
            duration={18}
            color={color}
            fontSize={resolvedTitleFontSize}
            fontFamily={fontFamily}
            fontWeight={titleFontWeight}
            letterSpacing={titleLetterSpacing}
            lineHeight={titleLineHeight}
          />
        )}

        <WordStagger kind="word-stagger"
          text={subtitle}
          delay={delay + SUBTITLE_OFFSET}
          duration={18}
          stagger={4}
          justify="center"
          color={subtitleColor}
          fontSize={resolvedSubtitleFontSize}
          fontFamily={fontFamily}
          fontWeight={subtitleFontWeight}
          letterSpacing={subtitleLetterSpacing}
          lineHeight={subtitleLineHeight}
        />
      </div>
    </PlacementBox>
  );
};
