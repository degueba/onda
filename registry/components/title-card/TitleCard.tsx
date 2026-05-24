import React from 'react';
import { z } from 'zod';
import { PlacementBox, placementSchema, sizeRoleSchema, resolveSize } from '../../../lib/canvas';
import { useVideoConfig } from 'remotion';
import { BlurReveal } from '../blur-reveal/BlurReveal';
import { WordStagger } from '../word-stagger/WordStagger';
import { Underline } from '../underline/Underline';

/** Zod schema for {@link TitleCard} props. */
export const titleCardSchema = z.object({
  /** Hero headline. */
  title: z.string().default('Onda'),
  /** Smaller phrase beneath the headline, cascaded word-by-word. */
  subtitle: z.string().default('premium motion graphics for Remotion'),
  /** Frames before the title starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the title. */
  accent: z.boolean().default(true),
  /** Title font size in px. Wins over `titleSize` if both are passed. */
  titleFontSize: z.number().default(160),
  /** Semantic role for the title — resolves to canvas-aware pixels. `titleFontSize` wins when both are passed. */
  titleSize: sizeRoleSchema.optional(),
  /** Font weight for the title. */
  titleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the title (e.g. `'-0.02em'`). */
  titleLetterSpacing: z.string().optional(),
  /** Unitless line height for the title. */
  titleLineHeight: z.number().optional(),
  /** Subtitle font size in px. Wins over `subtitleSize` if both are passed. */
  subtitleFontSize: z.number().default(32),
  /** Semantic role for the subtitle — resolves to canvas-aware pixels. `subtitleFontSize` wins when both are passed. */
  subtitleSize: sizeRoleSchema.optional(),
  /** Font weight for the subtitle. */
  subtitleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the subtitle (e.g. `'0.06em'`). */
  subtitleLetterSpacing: z.string().optional(),
  /** Unitless line height for the subtitle. */
  subtitleLineHeight: z.number().optional(),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Subtitle color. Defaults to `--onda-dim`. */
  subtitleColor: z.string().default('#8E8E98'),
  /** Accent rule color. Defaults to `--onda-accent` — the earned-color moment. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Defaults to centered. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link TitleCard}. */
export type TitleCardProps = z.infer<typeof titleCardSchema>;

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
          <Underline
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
          <BlurReveal
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

        <WordStagger
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
