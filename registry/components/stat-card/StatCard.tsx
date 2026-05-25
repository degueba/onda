import React from 'react';
import { useVideoConfig } from 'remotion';
import { CountUp } from '../count-up/CountUp';
import { WordStagger } from '../word-stagger/WordStagger';
import { Underline } from '../underline/Underline';
import { DURATION, STAGGER } from '../../../lib/motion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { statCardSchema, type StatCardProps } from './schema';

export { statCardSchema, type StatCardProps };

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
  numberSize,
  numberFontWeight,
  numberLetterSpacing,
  numberLineHeight,
  labelFontSize,
  labelSize,
  labelFontWeight,
  labelLetterSpacing,
  labelLineHeight,
  color,
  labelColor,
  accentColor,
  fontFamily,
  placement,
}) => {
  const { width, height } = useVideoConfig();
  const resolvedNumberFontSize = numberSize ? resolveSize(numberSize, { width, height }) : numberFontSize;
  const resolvedLabelFontSize = labelSize ? resolveSize(labelSize, { width, height }) : labelFontSize;
  // Sequence offsets, all derived from canonical motion tokens — no hardcoded
  // frame counts. The cascade follows: number → label → rule.
  const numberDuration = DURATION.slow;                                 // 24f
  const labelDelay = delay + numberDuration - STAGGER * 2;              // start ~8f before count settles
  const underlineDelay = labelDelay + DURATION.base + STAGGER * 2;      // rule trails the label

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
          fontSize={resolvedNumberFontSize}
          fontFamily={fontFamily}
          fontWeight={numberFontWeight}
          letterSpacing={numberLetterSpacing}
          lineHeight={numberLineHeight}
        />

        {/* The qualifier — words cascade in after the number has settled. */}
        <WordStagger
          text={label}
          delay={labelDelay}
          duration={DURATION.base}
          stagger={STAGGER}
          justify="center"
          color={labelColor}
          fontSize={resolvedLabelFontSize}
          fontFamily={fontFamily}
          fontWeight={labelFontWeight}
          letterSpacing={labelLetterSpacing}
          lineHeight={labelLineHeight}
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
            fontSize={resolvedLabelFontSize}
            fontFamily={fontFamily}
          />
        ) : null}
      </div>
    </PlacementBox>
  );
};
