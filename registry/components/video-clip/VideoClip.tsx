import React from 'react';
import { AbsoluteFill, OffthreadVideo, Loop, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { toFrames } from '../../../lib/timing';
import { videoClipSchema, type VideoClipProps } from './schema';

export { videoClipSchema, type VideoClipProps };

/**
 * A video clip with agent-friendly trim, Onda's entrance/exit fingerprint,
 * and optional looping. Wraps Remotion's `<OffthreadVideo>` (preferred over
 * `<Video>` for non-realtime renders — better seek accuracy, no audio drift).
 *
 * Default behavior fills the canvas (mirrors `ImageReveal` / `KenBurns`);
 * pass `placement` to position the clip as a sub-canvas element.
 *
 * @example
 * <VideoClip src="/clip.mp4" startAt="0:02" endAt="0:08" />
 *
 * @example
 * <VideoClip src="/bg.mp4" loop startAt={0} endAt="0:04" muted fade={false} />
 */
export const VideoClip: React.FC<VideoClipProps> = ({
  src, delay, startAt, endAt, fade, fadeDuration, muted, volume, loop, fit, placement, width, height, borderRadius,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve trim points to frames in source-video coordinates.
  const startFromFrames = toFrames(startAt, fps);
  const endAtFrames = endAt !== undefined ? toFrames(endAt, fps) : undefined;

  // Visible clip duration in composition frames — used for fade-out and loop
  // interval. Only knowable when endAt is set; without it, we can't time the
  // fade-out and we can't loop (there's no interval to repeat).
  const visibleDurationFrames =
    endAtFrames !== undefined ? Math.max(1, endAtFrames - startFromFrames) : undefined;

  // Fade-in/out envelope. Fade-out is skipped when looping (no defined end).
  let opacity = 1;
  if (fade) {
    const localFrame = frame - delay;
    if (localFrame < 0) {
      opacity = 0;
    } else {
      const fadeIn = fadeDuration > 0
        ? interpolate(localFrame, [0, fadeDuration], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })
        : 1;

      let fadeOut = 1;
      if (!loop && visibleDurationFrames !== undefined && fadeDuration > 0) {
        const fadeOutStart = Math.max(0, visibleDurationFrames - fadeDuration);
        fadeOut = interpolate(localFrame, [fadeOutStart, visibleDurationFrames], [1, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
      }

      opacity = Math.min(fadeIn, fadeOut);
    }
  }

  // Build the OffthreadVideo element. Sizing differs by placement mode —
  // canvas-fill default uses `100%`; placed mode honours explicit dims and
  // falls back to intrinsic size capped by PlacementBox's `max-width: 100%`.
  const fillCanvas = placement === undefined;
  const videoStyle: React.CSSProperties = {
    objectFit: fit,
    borderRadius,
    opacity,
    display: 'block',
    width: fillCanvas ? (width ?? '100%') : width,
    height: fillCanvas ? (height ?? '100%') : height,
  };

  const video = (
    <OffthreadVideo
      src={src}
      startFrom={startFromFrames}
      endAt={endAtFrames}
      muted={muted}
      volume={volume}
      style={videoStyle}
    />
  );

  // Loop wraps the video when requested. `<Loop>` repeats children every
  // `durationInFrames`, so the loop interval is the trimmed clip length.
  const looped = loop && visibleDurationFrames !== undefined
    ? <Loop durationInFrames={visibleDurationFrames}>{video}</Loop>
    : video;

  if (fillCanvas) {
    return <AbsoluteFill style={{ overflow: 'hidden' }}>{looped}</AbsoluteFill>;
  }

  return <PlacementBox placement={placement}>{looped}</PlacementBox>;
};
