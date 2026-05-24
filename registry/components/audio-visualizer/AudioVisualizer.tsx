import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  useAudioData,
  visualizeAudio,
  getWaveformPortion,
} from '@remotion/media-utils';
import { z } from 'zod';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Power-of-two check for the FFT bin count required by `visualizeAudio`. */
const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** Zod schema for {@link AudioVisualizer} props. */
export const audioVisualizerSchema = z.object({
  /** URL or path to the audio file. Same `src` as the parallel `AudioClip` typically plays. */
  src: z.string().default('https://www.w3schools.com/html/horse.mp3'),
  /**
   * Visualization variant:
   * - `'bars'` — real-time frequency-domain FFT bins. Animates with audio.
   *   The classic "spectrum analyzer" look.
   * - `'waveform'` — static track-spanning amplitude peaks (SoundCloud
   *   style). Same shape every frame, shows the whole audio at a glance.
   */
  variant: z.enum(['bars', 'waveform']).default('bars'),
  /**
   * Number of samples to render. MUST be a power of two (`visualizeAudio`
   * needs FFT bins of that shape; we keep the same constraint on waveform
   * for one consistent prop). For `'bars'` 32–64 is the sweet spot; for
   * `'waveform'` 128 reads as denser SoundCloud-style bars.
   */
  numberOfSamples: z
    .number()
    .int()
    .refine(isPowerOfTwo, { message: 'numberOfSamples must be a power of two' })
    .default(128),
  /**
   * 3-tap smoothing across adjacent samples — useful for `'bars'` (FFT
   * jitters frame-to-frame). Static waveform peaks don't need it.
   */
  smoothing: z.boolean().default(true),
  /** `'accuracy'` (default) | `'speed'`. Use `'speed'` for Lambda renders and high sample counts. */
  optimizeFor: z.enum(['accuracy', 'speed']).default('accuracy'),
  /** Bar color. Defaults to `--onda-accent` — visualizations are an earned-color moment. */
  color: z.string().default('#D96B82'),
  /**
   * Mirror around the horizontal centerline (Ableton / SoundCloud style).
   * When `true` (default), each bar extends symmetrically above AND below
   * center; set `false` to grow upward from a baseline only.
   */
  mirror: z.boolean().default(true),
  /**
   * Add a soft accent glow via `drop-shadow` filter. Subtle by default —
   * set `false` for a flat look.
   */
  glow: z.boolean().default(true),
  /** Where on the canvas this sits. Region or `{ x, y, anchor }`. Defaults to centered. */
  placement: placementSchema.optional(),
  /** Width in px. When omitted, the visualizer fills the placement box. */
  width: z.number().optional(),
  /** Height in px. */
  height: z.number().default(80),
  /** Gap between bars in px. */
  barGap: z.number().min(0).default(2),
  /** Border radius for bars in px. */
  barRadius: z.number().min(0).default(2),
});

/** Inferred props for {@link AudioVisualizer}. */
export type AudioVisualizerProps = z.infer<typeof audioVisualizerSchema>;

// Soft drop-shadow string used when `glow` is on. Tuned to read as a
// premium accent halo without dominating.
const GLOW_FILTER = 'drop-shadow(0 0 6px currentColor)';

/**
 * Renders an animated visualization of an audio file. **Does not play
 * audio.** Pair with a parallel `AudioClip` pointing at the same `src`
 * for audible playback.
 *
 * Two variants — both render as **vertical bars** (the SoundCloud /
 * Wavesurfer / Audacity look). Difference is the data source:
 *
 * - `'bars'` — real-time frequency-domain FFT bins via `visualizeAudio`.
 *   Animates with the audio, showing what's playing NOW. Classic
 *   spectrum analyzer.
 *
 * - `'waveform'` — static track-spanning amplitude peaks via
 *   `getWaveformPortion`. Same shape every frame, shows the whole
 *   audio's shape at a glance. SoundCloud-style.
 *
 * Visual identity (both variants):
 * - mirror by default — bars extend above + below a centerline
 * - linear color gradient — full opacity at the peaks, low-alpha at the
 *   center (mirror) or baseline (non-mirror)
 * - soft accent glow on peaks via `drop-shadow`
 * - single `color` prop drives the gradient + glow via the
 *   `currentColor` cascade
 *
 * Uses `useAudioData` (cached per src) so multiple visualizers on the
 * same file share one decode.
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
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);

  // `useAudioData` is async — null while loading. Render an empty placeholder
  // at the right dimensions so layout doesn't jump on load.
  if (!audioData) {
    return (
      <PlacementBox placement={placement}>
        <div style={{ width: width ?? '100%', height }} />
      </PlacementBox>
    );
  }

  // ─── compute amplitudes (0..1) ──────────────────────────────────────
  let amplitudes: number[];
  if (variant === 'bars') {
    // Real-time FFT: animates frame by frame.
    const bins = visualizeAudio({
      fps, frame, audioData, numberOfSamples, optimizeFor,
    });
    amplitudes = smoothing ? smoothBins(bins) : bins;
  } else {
    // Static track-spanning peaks via getWaveformPortion. Returns
    // [{ index, amplitude }] — compressed across the whole audio
    // duration. Same shape every frame.
    const peaks = getWaveformPortion({
      audioData,
      startTimeInSeconds: 0,
      durationInSeconds: audioData.durationInSeconds,
      numberOfSamples,
    });
    amplitudes = peaks.map((p) => p.amplitude);
  }

  // CSS gradient for each bar's fill. Mirror style fades to low-alpha at
  // the centerline (top + bottom bright, middle soft) so bars read as
  // soft volumetric shapes. Non-mirror fades upward from a dim baseline.
  const barGradient = mirror
    ? 'linear-gradient(to bottom, currentColor 0%, color-mix(in srgb, currentColor 30%, transparent) 50%, currentColor 100%)'
    : 'linear-gradient(to top, color-mix(in srgb, currentColor 30%, transparent) 0%, currentColor 100%)';

  return (
    <PlacementBox placement={placement}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: barGap,
          width: width ?? '100%',
          height,
          // currentColor cascades into the gradient stops — keeps a
          // single source of truth for the accent tint.
          color,
          filter: glow ? GLOW_FILTER : undefined,
        }}
      >
        {amplitudes.map((v, i) => {
          const barHeight = Math.max(2, v * height);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${barHeight}px`,
                backgroundImage: barGradient,
                backgroundColor: 'transparent',
                borderRadius: barRadius,
                // Mirror anchors the bar at the row's vertical center
                // (parent's `alignItems: 'center'` does the work).
                // Non-mirror pushes the bar to the bottom edge.
                alignSelf: mirror ? 'center' : 'flex-end',
              }}
            />
          );
        })}
      </div>
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
