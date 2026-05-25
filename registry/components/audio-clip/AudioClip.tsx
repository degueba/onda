import React from 'react';
import { Html5Audio, useVideoConfig, Loop } from 'remotion';
import { toFrames } from '../../../lib/timing';
import { audioClipSchema, type AudioClipProps } from './schema';

export { audioClipSchema, type AudioClipProps };

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
