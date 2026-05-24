import React from 'react';
import { AbsoluteFill, OffthreadVideo, Loop, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';
import { toFrames } from '../../../lib/timing';

const timeSpec = z.union([z.string(), z.number()]);

/** Zod schema for {@link VideoClip} props. */
export const videoClipSchema = z.object({
  /** URL or path to the video. */
  src: z.string().default('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
  /** Frames before the clip starts in the composition. */
  delay: z.number().int().min(0).default(0),
  /**
   * Where to start in the **source video**. Time spec — accepts `"0:04"`,
   * `"30s"`, `"500ms"`, `"90f"`, or a raw number of seconds.
   */
  startAt: timeSpec.default(0),
  /**
   * Where to stop in the **source video**. Same time spec as `startAt`.
   * When omitted, the clip plays to the source's end.
   */
  endAt: timeSpec.optional(),
  /**
   * Whether the clip fades in (and out, when `endAt` is set) for the Onda
   * motion fingerprint. Set to `false` for hard cuts (typical inside a
   * `<TransitionSeries>` where the transition primitive handles fades).
   */
  fade: z.boolean().default(true),
  /** Frames the fade-in / fade-out takes when `fade` is true. */
  fadeDuration: z.number().int().min(0).default(DURATION.base),
  /** Mute the audio track. */
  muted: z.boolean().default(false),
  /** Volume `0..1`. */
  volume: z.number().min(0).max(1).default(1),
  /**
   * Loop the trimmed clip. Requires `endAt` to be set (the loop interval is
   * `endAt - startAt`). When `loop` is true, fade-out is disabled — there's
   * no "end" to fade against until the parent `<Sequence>` terminates.
   */
  loop: z.boolean().default(false),
  /** How the video fits its box (`'cover'` crops to fill; `'contain'` letterboxes). */
  fit: z.enum(['cover', 'contain']).default('cover'),
  /**
   * Where on the canvas the clip sits. Region or `{ x, y, anchor }` in 0..1
   * canvas fractions. When omitted, the clip fills the entire canvas.
   */
  placement: placementSchema.optional(),
  /** Explicit width in px. */
  width: z.number().optional(),
  /** Explicit height in px. */
  height: z.number().optional(),
  /** Border radius in px. */
  borderRadius: z.number().default(0),
});

/** Inferred props for {@link VideoClip}. */
export type VideoClipProps = z.infer<typeof videoClipSchema>;

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
