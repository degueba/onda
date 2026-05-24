import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { WordStagger } from '../word-stagger/WordStagger';
import { FadeIn } from '../fade-in/FadeIn';
import { MaskReveal } from '../mask-reveal/MaskReveal';
import { DURATION, STAGGER } from '../../../lib/motion';

/** Zod schema for {@link QuoteCard} props. */
export const quoteCardSchema = z.object({
  /** The pull-quote body. Cascaded word-by-word on a slower-than-canonical stagger. */
  quote: z.string().default('Motion is the difference between art and craft.'),
  /** Attribution name. */
  author: z.string().default('Saul Bass'),
  /** Attribution role / title. */
  role: z.string().default('Graphic Designer'),
  /** Frames before the quote starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent divider between quote and attribution. */
  accent: z.boolean().default(true),
  /** Quote font size in px. */
  quoteFontSize: z.number().default(56),
  /** Author / role font size in px. */
  authorFontSize: z.number().default(22),
  /** Quote color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Author / role color. Defaults to `--onda-dim`. */
  authorColor: z.string().default('#8E8E98'),
  /** Divider color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link QuoteCard}. */
export type QuoteCardProps = z.infer<typeof quoteCardSchema>;

// Slower stagger between words than the canonical STAGGER (4 frames) — a quote
// needs to read, not cascade. This longer beat is the entire reason the
// scene-block exists rather than a bare WordStagger.
const QUOTE_STAGGER = STAGGER + 2; // 6 frames @ 30fps ≈ 0.20s — quiet, readable

// Divider geometry: a thin horizontal rule between quote and attribution.
// Built using MaskReveal's clip-path retreat by passing a full-block unicode
// character styled to the divider's size. This keeps the divider's motion
// identical to every other mask reveal in the library — the scene-block
// composes the primitive instead of reimplementing the clip animation.
const DIVIDER_WIDTH = 48; // px — small accent rule, never a full underline
const DIVIDER_HEIGHT = 2; // px

/**
 * A centered pull-quote scene block with attribution. The quote reveals
 * word-by-word with a slower-than-canonical stagger so the line **reads**
 * rather than cascades; after a settled beat a small accent-rose rule draws
 * in beneath it, then the author and role fade in together.
 *
 * Built for testimonials, documentary citations, and editorial section breaks.
 *
 * @example
 * <QuoteCard quote="..." author="Saul Bass" role="Designer" />
 */
export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  role,
  delay,
  accent,
  quoteFontSize,
  authorFontSize,
  color,
  authorColor,
  accentColor,
  fontFamily,
}) => {
  // Sequencing — each beat earns its moment, no two things move together.
  //   t=0                quote words begin staggering in (slower than canonical)
  //   t=quoteEnd + 8     divider mask-reveals (only if accent)
  //   t=dividerEnd + 4   author + role fade in together
  // The word count drives how long the quote takes to finish revealing.
  const words = quote.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);

  // Last word lands at: (wordCount - 1) * QUOTE_STAGGER + DURATION.base
  const quoteRevealEnd = (wordCount - 1) * QUOTE_STAGGER + DURATION.base;

  // Small breathing beat after the quote settles before the divider draws.
  const dividerDelay = delay + quoteRevealEnd + 8;
  const dividerDuration = DURATION.base;

  // Author + role fade in after the divider lands.
  const attributionDelay = dividerDelay + dividerDuration + 4;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 10%', // ~10% safe margins per CLAUDE.md spacing rule
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          maxWidth: '40%', // ~40% canvas wide for a pull-quote feel
          textAlign: 'center',
        }}
      >
        {/* Quote — words stagger in slowly so the line reads. The WordStagger
            primitive's flexWrap makes long quotes wrap naturally within the
            40% max-width container above. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <WordStagger
            text={quote}
            delay={delay}
            duration={DURATION.base}
            stagger={QUOTE_STAGGER}
            justify="center"
            color={color}
            fontSize={quoteFontSize}
            fontFamily={fontFamily}
          />
        </div>

        {/* Divider — accent-rose horizontal rule that mask-reveals from the
            left. Composes MaskReveal: we pass a unicode full-block ("█") as
            the "text", sized so its rendered glyph forms the bar. The
            primitive's clip-path animation then "draws" the rule across.
            Skipped entirely when accent === false — the parent gap still
            keeps the layout breathing. */}
        {accent && (
          <div
            style={{
              width: DIVIDER_WIDTH,
              height: DIVIDER_HEIGHT,
              overflow: 'hidden',
              // line-height: 1 plus matching fontSize lets the glyph fill the
              // wrapper exactly — no descender padding pushing the rule off.
              lineHeight: `${DIVIDER_HEIGHT}px`,
            }}
          >
            <MaskReveal
              text="████"
              delay={dividerDelay}
              duration={dividerDuration}
              direction="left"
              color={accentColor}
              fontSize={DIVIDER_HEIGHT}
              fontFamily={fontFamily}
            />
          </div>
        )}

        {/* Attribution — author + role. Both fade in together after the
            divider; the role sits dim beneath the author in the same column. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <FadeIn
            text={author}
            delay={attributionDelay}
            duration={DURATION.base}
            color={color}
            fontSize={authorFontSize}
            fontFamily={fontFamily}
          />
          <FadeIn
            text={role}
            delay={attributionDelay}
            duration={DURATION.base}
            color={authorColor}
            fontSize={authorFontSize}
            fontFamily={fontFamily}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default QuoteCard;
