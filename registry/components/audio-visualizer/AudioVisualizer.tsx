import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  useAudioData,
  visualizeAudio,
  visualizeAudioWaveform,
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
  /** Where on the canvas this sits. Region or `{ x, y, anchor }`. Defaults to centered. */
  placement: placementSchema.optional(),
  /** Width in px. When omitted, the visualizer fills the placement box. */
  width: z.number().optional(),
  /** Height in px. */
  height: z.number().default(80),
  /** Gap between bars in px (only `variant: 'bars'`). */
  barGap: z.number().min(0).default(4),
  /** Border radius for bars in px (only `variant: 'bars'`). */
  barRadius: z.number().min(0).default(2),
  /** Stroke width for the waveform line (only `variant: 'waveform'`). */
  waveformStrokeWidth: z.number().min(0.5).default(2),
});

/** Inferred props for {@link AudioVisualizer}. */
export type AudioVisualizerProps = z.infer<typeof audioVisualizerSchema>;

/**
 * Renders an animated visualization of an audio file — bars (frequency-domain)
 * or a waveform (time-domain). **Does not play audio.** Pair with a parallel
 * `AudioClip` pointing at the same `src` for audible playback.
 *
 * Uses `useAudioData` (cached per src) so multiple visualizers on the same
 * file share one decode. Bars use `visualizeAudio`; waveform uses
 * `visualizeAudioWaveform`.
 *
 * @example
 * <AudioVisualizer src="/voiceover.mp3" variant="waveform" placement="bottom" />
 *
 * @example
 * <AudioVisualizer src="/music.mp3" variant="bars" numberOfSamples={64} color="#D96B82" />
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  src, variant, numberOfSamples, smoothing, optimizeFor, color,
  placement, width, height, barGap, barRadius, waveformStrokeWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(src);

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

  if (variant === 'bars') {
    const values = visualizeAudio({
      fps, frame, audioData, numberOfSamples, optimizeFor,
    });

    // Optional 3-frame smoothing — average current with the prev/next bins.
    // visualizeAudio doesn't expose smoothing directly here; we apply a
    // simple symmetric window across the bin array.
    const smoothed = smoothing ? smoothBins(values) : values;

    return (
      <PlacementBox placement={placement}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: barGap,
            width: width ?? '100%',
            height,
          }}
        >
          {smoothed.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(2, v * height)}px`,
                backgroundColor: color,
                borderRadius: barRadius,
              }}
            />
          ))}
        </div>
      </PlacementBox>
    );
  }

  // variant === 'waveform'
  const samples = visualizeAudioWaveform({
    fps, frame, audioData, numberOfSamples,
    windowInSeconds: 1 / fps,
  });

  // Map samples into an SVG polyline path centered vertically.
  const w = width ?? 640;
  const points = samples
    .map((v, i) => {
      const x = (i / Math.max(1, samples.length - 1)) * w;
      // Samples are 0..1 amplitudes; map to ±(height/2) around the centerline.
      const y = height / 2 - (v - 0.5) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <PlacementBox placement={placement}>
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        style={{ display: 'block' }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={waveformStrokeWidth}
          strokeLinecap="round"
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
