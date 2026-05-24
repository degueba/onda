import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { SPRING_SMOOTH } from '../../../lib/motion';

/** Zod schema for {@link Captions} props. */
export const captionsSchema = z.object({
  /**
   * The transcript timeline. Each entry is a word + its `[startMs, endMs)`
   * window — the format every STT / transcript tool already speaks.
   */
  captions: z
    .array(
      z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
      }),
    )
    .default([
      { text: 'Onda', startMs: 0, endMs: 1500 },
      { text: 'kinetic', startMs: 1500, endMs: 3000 },
      { text: 'captions', startMs: 3000, endMs: 4500 },
    ]),
  /** Frames before the timeline starts (shifts every `startMs` by this). */
  delay: z.number().int().min(0).default(0),
  /** Inactive word color. Defaults to `--onda-dim`. */
  color: z.string().default('#8E8E98'),
  /** Active word color. Defaults to `--onda-text`. */
  accentColor: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight (e.g. 500, 600). */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing (e.g. `'-0.02em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.15` for caption stacks. */
  lineHeight: z.number().optional(),
  /** Text alignment of the caption block. */
  align: z.enum(['left', 'center', 'right']).optional(),
});

/** Inferred props for {@link Captions}. */
export type CaptionsProps = z.infer<typeof captionsSchema>;

/**
 * Sequential word-by-word captions driven by a timed array. The active word
 * lifts in `--onda-text` with a subtle `SPRING_SMOOTH` scale pulse; surrounding
 * words sit dim in `--onda-dim`. The data primitive for kinetic transcripts
 * and AI-generated voiceover.
 *
 * @example
 * <Captions captions={[{ text: 'Hi', startMs: 0, endMs: 500 }]} />
 */
export const Captions: React.FC<CaptionsProps> = ({
  captions,
  delay,
  color,
  accentColor,
  fontSize,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  align,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert the local frame (after `delay`) into milliseconds so the
  // captions array can be authored in real-world ms — the format every
  // transcript/STT tool already speaks.
  const local = Math.max(0, frame - delay);
  const currentMs = (local / fps) * 1000;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.3em',
        flexWrap: 'wrap',
        // Flex justification mirrors text-alignment intent for the wrapped block.
        justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        alignItems: 'baseline',
        color,
        fontSize,
        fontFamily,
        fontWeight,
        letterSpacing,
        lineHeight,
      }}
    >
      {captions.map((caption, i) => {
        const isActive =
          currentMs >= caption.startMs && currentMs < caption.endMs;

        // Frame at which this word becomes active, expressed in the
        // component's local frame timeline. Used to drive the activation
        // pulse — a subtle 0→1 SPRING_SMOOTH ramp over the first frames
        // of activation. Restrained: only a 4% scale lift, no overshoot.
        const activationLocalFrame =
          local - (caption.startMs / 1000) * fps;

        const pulse = spring({
          frame: activationLocalFrame,
          fps,
          config: SPRING_SMOOTH,
          durationInFrames: 4,
        });

        const pulseClamped = interpolate(pulse, [0, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const scale = isActive ? 1 + 0.04 * pulseClamped : 1;
        const wordColor = isActive ? accentColor : color;
        // Active word reads at full opacity; inactive words sit slightly
        // dimmer than --onda-dim's own value to push focus to the active
        // one without disappearing the surrounding context.
        const opacity = isActive ? 1 : 0.7;

        return (
          <span
            // Stable key derived from index + the caption boundaries so a
            // re-ordered captions array doesn't mis-key — deterministic.
            key={`${i}-${caption.startMs}-${caption.endMs}`}
            style={{
              color: wordColor,
              opacity,
              transform: `scale(${scale})`,
              transformOrigin: 'center bottom',
              display: 'inline-block',
            }}
          >
            {caption.text}
          </span>
        );
      })}
    </div>
  );
};
