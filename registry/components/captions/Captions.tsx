import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { SPRING_SMOOTH } from '../../../lib/motion';

export const captionsSchema = z.object({
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
  delay: z.number().int().min(0).default(0),       // frames before timeline starts
  color: z.string().default('#8E8E98'),            // --onda-dim (inactive words)
  accentColor: z.string().default('#F2F2F4'),      // --onda-text (active word)
  fontSize: z.number().default(96),
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  fontWeight: z.number().default(600),
});

export type CaptionsProps = z.infer<typeof captionsSchema>;

export const Captions: React.FC<CaptionsProps> = ({
  captions,
  delay,
  color,
  accentColor,
  fontSize,
  fontFamily,
  fontWeight,
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
        justifyContent: 'center',
        alignItems: 'baseline',
        color,
        fontSize,
        fontFamily,
        fontWeight,
        lineHeight: 1.15,
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
