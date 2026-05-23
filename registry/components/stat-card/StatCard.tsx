import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { CountUp } from '../count-up/CountUp';
import { WordStagger } from '../word-stagger/WordStagger';
import { Underline } from '../underline/Underline';
import { DURATION, STAGGER } from '../../../lib/motion';

/** Zod schema for {@link StatCard} props. */
export const statCardSchema = z.object({
  /** The headline number to count up to. */
  value: z.number().default(1247),
  /** Qualifier beneath the number — cascaded word-by-word. */
  label: z.string().default('creators this week'),
  /** Prepended to the number (e.g. `'$'`). */
  prefix: z.string().default(''),
  /** Appended to the number (e.g. `'%'`). */
  suffix: z.string().default(''),
  /** Frames before the count starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent rule beneath the label. */
  accent: z.boolean().default(true),
  /** Number font size in px. */
  numberFontSize: z.number().default(200),
  /** Label font size in px. */
  labelFontSize: z.number().default(28),
  /** Number color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Label color. Defaults to `--onda-dim`. */
  labelColor: z.string().default('#8E8E98'),
  /** Accent rule color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link StatCard}. */
export type StatCardProps = z.infer<typeof statCardSchema>;

// Scene block: composes CountUp (number), WordStagger (label), Underline
// (accent rule). The big number lands first; the label cascades in after the
// number has settled; the accent rule draws last. One focal element at a
// time, in sequence — the Onda "data look."
//
// Timing rationale: CountUp defaults to DURATION.slow (24f) because numbers
// want more time than a text fade. The label starts a beat *before* the
// count fully settles so the eye flows from number to label without a dead
// pause. The underline is the final punctuation — it earns the accent rose.
/**
 * Flagship Onda data scene — a big counted-up number above a word-staggered
 * label above an accent rule. Composes `CountUp`, `WordStagger`, and
 * `Underline` so the cascade (number → label → rule) reads as one calm
 * motion. The signature "Onda data look" for hero stats, KPIs, milestones.
 *
 * @example
 * <StatCard value={1247} label="creators this week" />
 */
export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  prefix,
  suffix,
  delay,
  accent,
  numberFontSize,
  labelFontSize,
  color,
  labelColor,
  accentColor,
  fontFamily,
}) => {
  // Sequence offsets, all derived from canonical motion tokens — no hardcoded
  // frame counts. The cascade follows: number → label → rule.
  const numberDuration = DURATION.slow;                                 // 24f
  const labelDelay = delay + numberDuration - STAGGER * 2;              // start ~8f before count settles
  const underlineDelay = labelDelay + DURATION.base + STAGGER * 2;      // rule trails the label

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* The headline number — counts up from 0 to value on SPRING_SMOOTH. */}
      <CountUp
        from={0}
        to={value}
        delay={delay}
        duration={numberDuration}
        decimals={0}
        prefix={prefix}
        suffix={suffix}
        color={color}
        fontSize={numberFontSize}
        fontFamily={fontFamily}
      />

      {/* The qualifier — words cascade in after the number has settled. */}
      <WordStagger
        text={label}
        delay={labelDelay}
        duration={DURATION.base}
        stagger={STAGGER}
        color={labelColor}
        fontSize={labelFontSize}
        fontFamily={fontFamily}
      />

      {/* The accent rule — earned punctuation, draws last. Only when accent.
          Underline is text-aware: we pass the label as its sizing text but
          render the glyphs transparent so what the eye sees is the rule
          alone, proportioned to the label above it. */}
      {accent ? (
        <Underline
          text={label}
          delay={underlineDelay}
          duration={1}
          lineDelay={0}
          lineDuration={DURATION.fast}
          color="transparent"
          accentColor={accentColor}
          lineThickness={3}
          lineOffset={0}
          fontSize={labelFontSize}
          fontFamily={fontFamily}
        />
      ) : null}
    </AbsoluteFill>
  );
};
