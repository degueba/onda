import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  useAudioData,
  visualizeAudio,
  visualizeAudioWaveform,
  createSmoothSvgPath,
} from '@remotion/media-utils';
import { z } from 'zod';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Power-of-two check for the FFT bin count required by `visualizeAudio`. */
const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** Zod schema for {@link AudioVisualizer} props. */
export const audioVisualizerSchema = z.object({
  /** URL or path to the audio file. Same `src` as the parallel `AudioClip` typically plays. */
  src: z.string().default('https://www.w3schools.com/html/horse.mp3'),
  /** Visualization variant. `'bars'` is frequency-domain; `'waveform'` is time-domain. */
  variant: z.enum(['bars', 'waveform']).default('bars'),
  /**
   * FFT bin count for `'bars'`. MUST be a power of two (32, 64, 128…). 32 is
   * the visual sweet spot; raise past 128 with `optimizeFor: 'speed'` only.
   */
  numberOfSamples: z
    .number()
    .int()
    .refine(isPowerOfTwo, { message: 'numberOfSamples must be a power of two' })
    .default(32),
  /**
   * 3-frame-average the data (prev/current/next) for less jittery output.
   * Boolean, not a configurable count — Remotion's API constraint.
   */
  smoothing: z.boolean().default(true),
  /**
   * `'accuracy'` (default) | `'speed'`. Use `'speed'` for Lambda renders
   * and high sample counts.
   */
  optimizeFor: z.enum(['accuracy', 'speed']).default('accuracy'),
  /** Bar / waveform color. Defaults to `--onda-accent` — visualizations are an earned-color moment. */
  color: z.string().default('#D96B82'),
  /**
   * Mirror around the horizontal centerline (Ableton / SoundCloud style).
   * When `true` (default), bars / waveform extend symmetrically above AND
   * below center; set `false` to grow upward from a baseline only.
   */
  mirror: z.boolean().default(true),
  /**
   * Add a soft accent glow on peaks (a drop-shadow filter on the rendered
   * element). Subtle by default — set `false` for a flat look.
   */
  glow: z.boolean().default(true),
  /** Where on the canvas this sits. Region or `{ x, y, anchor }`. Defaults to centered. */
  placement: placementSchema.optional(),
  /** Width in px. When omitted, the visualizer fills the placement box. */
  width: z.number().optional(),
  /** Height in px. */
  height: z.number().default(80),
  /** Gap between bars in px (only `variant: 'bars'`). */
  barGap: z.number().min(0).default(4),
  /** Border radius for bars in px (only `variant: 'bars'`). */
  barRadius: z.number().min(0).default(3),
  /** Stroke width for the waveform outline (only `variant: 'waveform'`). */
  waveformStrokeWidth: z.number().min(0).default(0),
  /** Fill opacity for the waveform body (only `variant: 'waveform'`). */
  waveformFillOpacity: z.number().min(0).max(1).default(1),
});

/** Inferred props for {@link AudioVisualizer}. */
export type AudioVisualizerProps = z.infer<typeof audioVisualizerSchema>;

// Soft drop-shadow string used when `glow` is on. Tuned to read as a
// premium accent halo without dominating — matches Onda's overall
// restraint (one accent moment per scene).
const GLOW_FILTER = 'drop-shadow(0 0 6px currentColor)';

/**
 * Renders an animated visualization of an audio file — bars (frequency-
 * domain) or a waveform (time-domain). **Does not play audio.** Pair with
 * a parallel `AudioClip` pointing at the same `src` for audible playback.
 *
 * Visual treatment (matches the SoundCloud / Wavesurfer modern look):
 *   - mirror shape (`mirror: true`) — bars / waveform extend symmetrically
 *     above and below the centerline
 *   - linear color gradient from full opacity at the peaks → low-alpha at
 *     the centerline, so the shape reads as a soft volumetric body
 *   - subtle accent glow on peaks (`glow: true`) via `drop-shadow`
 *
 * Uses `useAudioData` (cached per src) so multiple visualizers on the same
 * file share one decode. Bars use `visualizeAudio`; waveform uses
 * `visualizeAudioWaveform` + `createSmoothSvgPath` for Bezier curves.
 *
 * @example
 * <AudioVisualizer src="/voiceover.mp3" variant="waveform" placement="bottom" />
 *
 * @example
 * <AudioVisualizer src="/music.mp3" variant="bars" numberOfSamples={64} color="#D96B82" />
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  src, variant, numberOfSamples, smoothing, optimizeFor, color,
  mirror, glow, placement, width, height, barGap, barRadius,
  waveformStrokeWidth, waveformFillOpacity,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);
  // `useId()` must be called unconditionally on every render — hoisted
  // above the early returns and variant branches so the hook order is
  // stable when audioData loads or `variant` toggles. The id is only
  // consumed in the waveform branch's SVG `<linearGradient>`.
  const gradientId = React.useId();

  // `useAudioData` is async — null while loading. Render an empty placeholder
  // at the right dimensions so layout doesn't jump on load. The placeholder
  // also covers the SSR pass.
  if (!audioData) {
    return (
      <PlacementBox placement={placement}>
        <div style={{ width: width ?? '100%', height }} />
      </PlacementBox>
    );
  }

  // CSS background-image for a gradient bar. Mirror style fades to a low-
  // alpha center; non-mirror style fades a flat color downward.
  // `color` is the accent at full opacity; we just dial alpha to fade.
  // (Using currentColor + an opacity multiplier keeps the gradient in sync
  // with whatever color prop is passed, including CSS variables.)
  const barGradient = mirror
    ? 'linear-gradient(to bottom, currentColor 0%, transparent 48%, transparent 52%, currentColor 100%)'
    : 'linear-gradient(to top, color-mix(in srgb, currentColor 25%, transparent) 0%, currentColor 100%)';

  if (variant === 'bars') {
    const values = visualizeAudio({
      fps, frame, audioData, numberOfSamples, optimizeFor,
    });
    const smoothed = smoothing ? smoothBins(values) : values;

    return (
      <PlacementBox placement={placement}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: barGap,
            width: width ?? '100%',
            height,
            // currentColor cascades into the gradient stops below — keeps a
            // single source of truth for the accent tint.
            color,
            filter: glow ? GLOW_FILTER : undefined,
          }}
        >
          {smoothed.map((v, i) => {
            // Mirror: each bar's TOTAL height is `v * height`, centered on
            // the row's middle (the parent's `alignItems: 'center'` does
            // the centering). Non-mirror: bars hug the bottom.
            const barHeight = Math.max(2, v * height);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${barHeight}px`,
                  // CSS gradient via background-image. `currentColor` picks
                  // up from the row's color above.
                  backgroundImage: barGradient,
                  backgroundColor: 'transparent',
                  borderRadius: barRadius,
                  // For non-mirror, push each bar down so it grows upward
                  // from the row's bottom edge instead of from center.
                  alignSelf: mirror ? 'center' : 'flex-end',
                }}
              />
            );
          })}
        </div>
      </PlacementBox>
    );
  }

  // ─── variant === 'waveform' ──────────────────────────────────────────
  // `visualizeAudioWaveform` returns AMPLITUDE MAGNITUDES (0..1) — one
  // non-negative number per sample, NOT signed PCM. The right rendering is
  // a mirror waveform: each sample's amplitude extends symmetrically above
  // and below a centerline. Smooth Bezier outline via `createSmoothSvgPath`.
  const samples = visualizeAudioWaveform({
    fps, frame, audioData, numberOfSamples,
    windowInSeconds: 1 / fps,
  });

  const w = width ?? 640;
  const halfH = height / 2;
  const denom = Math.max(1, samples.length - 1);
  // Non-mirror waveform anchors amplitudes to the bottom edge instead of
  // mirroring around center. Less common but useful for sub-bar metering.
  const baseY = mirror ? halfH : height;
  const amp = mirror ? halfH : height;

  const topPoints = samples.map((v, i) => ({
    x: (i / denom) * w,
    y: baseY - v * amp,
  }));
  const bottomPoints = [...samples].reverse().map((v, i) => ({
    x: ((samples.length - 1 - i) / denom) * w,
    y: mirror ? halfH + v * halfH : height,
  }));

  const topPath = createSmoothSvgPath({ points: topPoints });
  const bottomPath = createSmoothSvgPath({ points: bottomPoints });
  const bottomBody = bottomPath.replace(/^M[^ ]+ [^ ]+ ?/, 'L ');
  const closedPath = `${topPath} ${bottomBody} Z`;

  return (
    <PlacementBox placement={placement}>
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        style={{
          display: 'block',
          color,
          filter: glow ? GLOW_FILTER : undefined,
        }}
      >
        <defs>
          {/* Linear gradient: peaks at full opacity, fading toward the
              centerline. Same identity as the bars' gradient stops above —
              the shape reads as a soft volumetric body. For non-mirror,
              the gradient is top-bright fading down. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {mirror ? (
              <>
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="48%" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="52%" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          d={closedPath}
          fill={`url(#${gradientId})`}
          fillOpacity={waveformFillOpacity}
          stroke={waveformStrokeWidth > 0 ? 'currentColor' : 'none'}
          strokeWidth={waveformStrokeWidth}
          strokeLinejoin="round"
        />
      </svg>
    </PlacementBox>
  );
};

/**
 * 3-tap symmetric smoothing across an array of FFT bins. Pure function of
 * the input (deterministic per frame). Edges fall back to single-tap.
 */
function smoothBins(values: number[]): number[] {
  if (values.length < 3) return values;
  return values.map((_, i) => {
    if (i === 0 || i === values.length - 1) return values[i];
    return (values[i - 1] + values[i] + values[i + 1]) / 3;
  });
}

export default AudioVisualizer;
