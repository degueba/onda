import React from 'react';
import { Html5Audio, useVideoConfig, Loop } from 'remotion';
import { z } from 'zod';
import { toFrames } from '../../../lib/timing';

const timeSpec = z.union([z.string(), z.number()]);

/** Zod schema for {@link AudioClip} props. */
export const audioClipSchema = z.object({
  /** URL or path to the audio file. AAC-in-MP4 or WAV preferred (see README format hints). */
  src: z.string().default('https://www.w3schools.com/html/horse.mp3'),
  /**
   * Where to start in the **source audio**. Time spec — accepts `"0:04"`,
   * `"30s"`, `"500ms"`, `"90f"`, or a raw number of seconds.
   */
  startAt: timeSpec.default(0),
  /**
   * Where to stop in the source. Same time spec as `startAt`. When omitted,
   * the clip plays to the source's end. Required for `loop: true`.
   */
  endAt: timeSpec.optional(),
  /** Amplitude volume `0..1`. */
  volume: z.number().min(0).max(1).default(1),
  /**
   * Advanced gain in dB. When set, wins over `volume`. Sound designers think
   * in dB; agents pick `volume` from a 0..1 UI. Converted via `10 ** (dB / 20)`.
   * Examples: `0` = unity (1.0), `-6` ≈ 0.5, `-12` ≈ 0.25, `-20` ≈ 0.1.
   */
  gainDb: z.number().optional(),
  /**
   * Apply an entry/exit volume envelope. Default `true` with a tiny 2-frame
   * fade — imperceptible, prevents start/end clicks most codecs introduce.
   * Set larger `fadeDuration` for audible bed fades. Set `fade: false` only
   * inside crossfade primitives that own the envelope.
   */
  fade: z.boolean().default(true),
  /** Frames the fade-in / fade-out takes. Default 2 (~67ms @ 30fps). */
  fadeDuration: z.number().int().min(0).default(2),
  /**
   * Loop the trimmed clip. Requires `endAt` to be set (loop interval is
   * `endAt - startAt`). When looping, fade-out is auto-disabled — there's
   * no defined end until the parent `<Sequence>` terminates.
   */
  loop: z.boolean().default(false),
  /** Mute the clip. */
  muted: z.boolean().default(false),
  /** Playback speed. Browser-clamped 0.0625..16. */
  playbackRate: z.number().min(0.0625).max(16).default(1),
  /**
   * Acceptable time-shift threshold before Remotion resyncs (seconds).
   * Default `0.1` — tighter than Remotion's own 0.45 default because Onda
   * compositions are usually beat-locked.
   */
  acceptableTimeShiftSeconds: z.number().min(0).default(0.1),
});

/** Inferred props for {@link AudioClip}. */
export type AudioClipProps = z.infer<typeof audioClipSchema>;

/**
 * The workhorse audio primitive: a single audio file with agent-friendly
 * trim, an opt-in fade envelope, optional looping, and a dB-or-amplitude
 * volume contract. Used for music beds, voiceover, and sound effects —
 * patterns differ, the component doesn't.
 *
 * Wraps Remotion's `<Audio>` (the current official audio component). Volume
 * is delivered as a callback so the fade envelope, dB conversion, and
 * loop-aware fade-out all live in one place and Remotion can draw the
 * volume curve in Studio.
 *
 * @example
 * <AudioClip src="/voiceover.mp3" startAt="0:02" endAt="0:08" />
 *
 * @example Music bed
 * <AudioClip src="/bed.mp3" loop startAt={0} endAt="0:30" volume={0.4} fadeDuration={45} />
 */
export const AudioClip: React.FC<AudioClipProps> = ({
  src, startAt, endAt, volume, gainDb, fade, fadeDuration,
  loop, muted, playbackRate, acceptableTimeShiftSeconds,
}) => {
  const { fps } = useVideoConfig();

  const startFromFrames = toFrames(startAt, fps);
  const endAtFrames = endAt !== undefined ? toFrames(endAt, fps) : undefined;

  // Visible clip duration in composition frames. Needed for fade-out and
  // for looping (defines the loop interval).
  const visibleDurationFrames =
    endAtFrames !== undefined ? Math.max(1, endAtFrames - startFromFrames) : undefined;

  // dB wins when set, else amplitude. dB → amplitude: 10 ** (dB / 20).
  const baseAmplitude = gainDb !== undefined ? Math.pow(10, gainDb / 20) : volume;

  // Volume callback. `clipFrame` is clip-local (0 at clip start). When
  // `fade` is true we apply an entrance/exit envelope; otherwise constant
  // amplitude. Loop disables fade-out — there's no defined end frame from
  // the clip's perspective.
  const volumeFn = (clipFrame: number): number => {
    if (!fade || fadeDuration <= 0) return baseAmplitude;

    const fadeIn = Math.min(1, clipFrame / fadeDuration);
    let fadeOut = 1;
    if (!loop && visibleDurationFrames !== undefined) {
      const fadeOutStart = Math.max(0, visibleDurationFrames - fadeDuration);
      const remaining = visibleDurationFrames - clipFrame;
      fadeOut = Math.max(0, Math.min(1, remaining / fadeDuration));
      // Guard against negative fadeOutStart producing odd shapes for very short clips.
      if (clipFrame < fadeOutStart) fadeOut = 1;
    }
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
    return baseAmplitude * envelope;
  };

  const audio = (
    <Html5Audio
      src={src}
      trimBefore={startFromFrames}
      trimAfter={endAtFrames}
      muted={muted}
      volume={volumeFn}
      playbackRate={playbackRate}
      acceptableTimeShiftInSeconds={acceptableTimeShiftSeconds}
    />
  );

  // `<Loop>` repeats children every `durationInFrames`, so the loop
  // interval is the trimmed clip length. The parent `<Sequence>` bounds
  // when the looped audio terminates.
  if (loop && visibleDurationFrames !== undefined) {
    return <Loop durationInFrames={visibleDurationFrames}>{audio}</Loop>;
  }

  return audio;
};

export default AudioClip;
