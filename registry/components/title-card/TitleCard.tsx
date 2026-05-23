import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
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
  /** Title font size in px. */
  titleFontSize: z.number().default(160),
  /** Subtitle font size in px. */
  subtitleFontSize: z.number().default(32),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Subtitle color. Defaults to `--onda-dim`. */
  subtitleColor: z.string().default('#8E8E98'),
  /** Accent rule color. Defaults to `--onda-accent` — the earned-color moment. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
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
  subtitleFontSize,
  color,
  subtitleColor,
  accentColor,
  fontFamily,
}) => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
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
          fontSize={titleFontSize}
          fontFamily={fontFamily}
        />
      ) : (
        <BlurReveal
          text={title}
          delay={delay}
          duration={18}
          color={color}
          fontSize={titleFontSize}
          fontFamily={fontFamily}
        />
      )}

      <WordStagger
        text={subtitle}
        delay={delay + SUBTITLE_OFFSET}
        duration={18}
        stagger={4}
        color={subtitleColor}
        fontSize={subtitleFontSize}
        fontFamily={fontFamily}
      />
    </AbsoluteFill>
  );
};
