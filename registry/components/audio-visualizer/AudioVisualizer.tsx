import React from 'react';
import { useCurrentFrame, useVideoConfig, Easing, random } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { z } from 'zod';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

// ─── audio-signal helpers ────────────────────────────────────────────
//
// Standard W3C / WebAudio signal-processing primitives. These bridge the
// gap between `visualizeAudio`'s raw FFT magnitudes (most below 0.1, hard
// to see) and the responsive 0..1 amplitudes a visualizer expects.

const toDecibel = (v: number) => 20 * Math.log10(v);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const normalize = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);

/**
 * Convert a raw FFT magnitude into a perceptually-scaled `[0, 1]` value
 * via decibel normalization. The default range (`-100dB..-30dB`) is the
 * "interesting" range for music — without this, raw `visualizeAudio()`
 * output looks dead because almost all magnitudes sit between 0 and 0.1.
 */
const processFftValue = (v: number, minDb: number, maxDb: number): number => {
  const db = toDecibel(v);
  return clamp(normalize(db, minDb, maxDb), 0, 1);
};

/** RMS of an array — a single scalar representing overall "loudness". */
const getRms = (values: number[]): number => {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i] * values[i];
  return Math.sqrt(sum / values.length);
};

/** Rotate an array left by `n` positions — used by `hills` for the stacked copies. */
const rotate = <T,>(arr: T[], n: number): T[] => {
  if (!n) return [...arr];
  const k = n % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
};

// ─── schema ──────────────────────────────────────────────────────────

/** Zod schema for {@link AudioVisualizer} props. */
export const audioVisualizerSchema = z.object({
  /** URL or path to the audio file. */
  src: z.string().default('https://www.w3schools.com/html/horse.mp3'),
  /**
   * Visualization variant:
   * - `'bars'` — FFT bars (spectrum analyzer).
   * - `'wave'` — parametric sine wave driven by audio RMS energy.
   * - `'hills'` — filled smooth-curve "mountains" mirrored around a centerline.
   * - `'radial'` — bars arranged in a circle, audio drives each ray.
   */
  variant: z.enum(['bars', 'wave', 'hills', 'radial']).default('bars'),
  /** Width in px. */
  width: z.number().default(640),
  /** Height in px. */
  height: z.number().default(160),
  /** Accent color. Defaults to `--onda-accent`. */
  color: z.string().default('#D96B82'),
  /** Add a soft accent glow via `drop-shadow`. */
  glow: z.boolean().default(true),

  /** Lower bound (dB) for FFT normalization. Anything below maps to 0. */
  minDb: z.number().default(-100),
  /** Upper bound (dB) for FFT normalization. Anything above maps to 1. */
  maxDb: z.number().default(-30),
  /** FFT bin count (power of two). 256 = dense, 64 = chunky. */
  numberOfSamples: z.number().int().default(256),

  // ── bars-only ───────────────────────────────────────────────────────
  /** Bar width in px (`'bars'`). */
  barWidth: z.number().min(1).default(4),
  /** Gap between bars in px (`'bars'`). */
  barGap: z.number().min(0).default(4),
  /** Corner radius for bars in px (`'bars'`). */
  barRadius: z.number().min(0).default(2),
  /** Vertical placement (`'bars'`). */
  barAlign: z.enum(['top', 'middle', 'bottom']).default('middle'),

  // ── wave-only ───────────────────────────────────────────────────────
  /** Number of sine-wave sections across the width (`'wave'`). */
  waveSections: z.number().int().min(2).default(12),
  /** Number of stacked wave lines (`'wave'`). */
  waveLines: z.number().int().min(1).default(2),
  /** Vertical gap between stacked wave lines in px (`'wave'`). */
  waveLineGap: z.number().min(0).default(16),
  /** Stroke thickness of each wave line in px (`'wave'`). */
  waveStrokeWidth: z.number().min(0.5).default(2),
  /** Horizontal scroll speed in px/sec — wave drifts left as audio plays (`'wave'`). */
  waveScrollSpeed: z.number().default(-160),

  // ── hills-only ──────────────────────────────────────────────────────
  /** Number of bumps across the width (`'hills'`). 8 reads natural. */
  hillsBumps: z.number().int().min(2).default(8),
  /** Number of stacked hill copies for depth (`'hills'`). */
  hillsCopies: z.number().int().min(1).default(2),
  /** Vertical placement (`'hills'`). `'middle'` mirrors above/below the centerline. */
  hillsAlign: z.enum(['top', 'middle', 'bottom']).default('middle'),
  /** Fill opacity for each hill copy (`'hills'`). */
  hillsFillOpacity: z.number().min(0).max(1).default(0.4),
  /** Stroke width for each hill copy (`'hills'`). `0` = no outline. */
  hillsStrokeWidth: z.number().min(0).default(0),
  /** Deterministic seed for the per-bump amplitude variation (`'hills'`). */
  hillsSeed: z.union([z.number(), z.string()]).default(42),

  // ── radial-only ─────────────────────────────────────────────────────
  /** Diameter of the radial visualizer in px (`'radial'`). Overrides width/height. */
  radialDiameter: z.number().min(10).default(360),
  /** Inner radius — bars start outside this ring (`'radial'`). */
  radialInnerRadius: z.number().min(0).default(80),
  /** Bar thickness in px (`'radial'`). */
  radialBarWidth: z.number().min(1).default(4),
  /** Gap between adjacent radial bars in px (along the ring) (`'radial'`). */
  radialBarGap: z.number().min(0).default(4),
  /** Bar corner radius in px (`'radial'`). */
  radialBarRadius: z.number().min(0).default(2),
  /** Where each bar grows from (`'radial'`): outward, inward, or centered on the ring. */
  radialBarOrigin: z.enum(['outer', 'inner', 'middle']).default('inner'),

  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link AudioVisualizer}. */
export type AudioVisualizerProps = z.infer<typeof audioVisualizerSchema>;

// Drop-shadow string used when `glow` is on. Tuned for a soft accent halo.
const GLOW_FILTER = 'drop-shadow(0 0 6px currentColor)';

/**
 * Renders an animated visualization of an audio file. **Does not play
 * audio** — pair with `AudioClip` for playback.
 *
 * Four variants, all driven by the same dB-normalized FFT pipeline:
 *
 * - `'bars'` — frequency-domain bars (spectrum analyzer).
 * - `'wave'` — parametric sine wave whose amplitude is driven by RMS.
 * - `'hills'` — filled smooth-curve "mountains" mirrored around center.
 * - `'radial'` — bars arranged in a circle, each bar driven by an FFT bin.
 *
 * All four share the same Onda accent treatment — single `color` prop,
 * soft glow via `drop-shadow`.
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = (props) => {
  const audioData = useAudioData(props.src);

  if (!audioData) {
    const w = props.variant === 'radial' ? props.radialDiameter : props.width;
    const h = props.variant === 'radial' ? props.radialDiameter : props.height;
    return (
      <PlacementBox placement={props.placement}>
        <div style={{ width: w, height: h }} />
      </PlacementBox>
    );
  }

  const child =
    props.variant === 'bars' ? <BarsVariant {...props} audioData={audioData} />
    : props.variant === 'wave' ? <WaveVariant {...props} audioData={audioData} />
    : props.variant === 'hills' ? <HillsVariant {...props} audioData={audioData} />
    : <RadialVariant {...props} audioData={audioData} />;

  return <PlacementBox placement={props.placement}>{child}</PlacementBox>;
};

type V = AudioVisualizerProps & { audioData: NonNullable<ReturnType<typeof useAudioData>> };

// ─── BARS ────────────────────────────────────────────────────────────

const BarsVariant: React.FC<V> = ({
  audioData, width, height, color, glow,
  barWidth, barGap, barRadius, barAlign,
  minDb, maxDb, numberOfSamples,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = visualizeAudio({ fps, frame, audioData, numberOfSamples });

  const slot = barWidth + barGap;
  const nBars = Math.max(1, Math.floor(width / slot));
  const sampleStep = Math.max(1, Math.floor(raw.length / nBars));

  const bars = Array.from({ length: nBars }, (_, i) => {
    const v = raw[(i * sampleStep) % raw.length] ?? 0;
    const processed = processFftValue(v, minDb, maxDb);
    return Math.log(1 + processed) / Math.log(2);
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', color, filter: glow ? GLOW_FILTER : undefined }}
    >
      <defs>
        <linearGradient id="ondaBarGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {bars.map((v, i) => {
        const h = Math.max(barRadius * 2, v * height);
        const x = i * slot;
        const y =
          barAlign === 'top' ? 0
          : barAlign === 'bottom' ? height - h
          : (height - h) / 2;
        return (
          <rect
            key={i} x={x} y={y}
            width={barWidth} height={h}
            rx={barRadius}
            fill="url(#ondaBarGradient)"
          />
        );
      })}
    </svg>
  );
};

// ─── WAVE ────────────────────────────────────────────────────────────

const WaveVariant: React.FC<V> = ({
  audioData, width, height, color, glow,
  waveSections, waveLines, waveLineGap, waveStrokeWidth, waveScrollSpeed,
  minDb, maxDb, numberOfSamples,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = visualizeAudio({ fps, frame, audioData, numberOfSamples });

  // Skip sub-bass to get a perceptually-correct loudness signal.
  const focused = raw.slice(Math.floor(0.25 * raw.length));
  const processed = focused.map((v) => processFftValue(v, minDb, maxDb));
  const rms = getRms(processed);
  const amplitude = rms * (height * 0.45);

  const t = frame / fps;
  const offsetPixels = waveScrollSpeed * t;
  const sectionWidth = width / waveSections;
  const off = offsetPixels % (2 * sectionWidth);

  const totalGapHeight = (waveLines - 1) * waveLineGap;
  const linesStartY = -totalGapHeight / 2;

  const lines = Array.from({ length: waveLines }, (_, lineIndex) => {
    const yShift = linesStartY + lineIndex * waveLineGap;
    return buildWavePath({
      width, sections: waveSections, amplitude,
      offsetPixels: off + lineIndex * 6, yShift,
    });
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${-height / 2} ${width} ${height}`}
      style={{ display: 'block', color, filter: glow ? GLOW_FILTER : undefined }}
    >
      {lines.map((d, i) => (
        <path
          key={i} d={d}
          stroke="currentColor"
          strokeWidth={waveStrokeWidth}
          strokeLinecap="round"
          strokeOpacity={1 - i * 0.25}
          fill="none"
        />
      ))}
    </svg>
  );
};

function buildWavePath({
  width, sections, amplitude, offsetPixels, yShift,
}: { width: number; sections: number; amplitude: number; offsetPixels: number; yShift: number }): string {
  const numberOfPoints = sections * 2;
  const step = 1 / numberOfPoints;
  const stepOffset = offsetPixels / width;

  const points = Array.from({ length: numberOfPoints }, (_, i) => {
    const fraction = ((i - 0.5) % numberOfPoints) * step - stepOffset;
    let x = (fraction + 1) % 1;
    x = x * width;
    let y = Math.sin(Math.abs(fraction) * Math.PI);
    y = Easing.cubic(y);
    y = y * amplitude;
    y = y * Math.sin((0.5 + i) * Math.PI);
    return { x, y: y + yShift };
  }).sort((a, b) => a.x - b.x);

  const sectionW = width / sections;
  const cpDist = 0.4 * sectionW;
  const segments = points.map((p, i, arr) => {
    const prev = i === 0 ? { x: 0, y: yShift } : arr[i - 1];
    return `C ${prev.x + cpDist} ${prev.y}, ${p.x - cpDist} ${p.y}, ${p.x} ${p.y}`;
  });
  const last = points[points.length - 1];
  const tail = `C ${last.x + cpDist} ${last.y}, ${width - cpDist} ${yShift}, ${width} ${yShift}`;
  return `M 0 ${yShift} ${segments.join(' ')} ${tail}`;
}

// ─── HILLS ───────────────────────────────────────────────────────────

const HillsVariant: React.FC<V> = ({
  audioData, width, height, color, glow,
  hillsBumps, hillsCopies, hillsAlign, hillsFillOpacity, hillsStrokeWidth, hillsSeed,
  minDb, maxDb, numberOfSamples,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = visualizeAudio({ fps, frame, audioData, numberOfSamples });

  // Sample mid-range frequencies — same focus Marcus uses (most of the
  // perceived "shape" of music sits in this band).
  const start = Math.floor(0.2 * raw.length);
  const end = Math.floor(0.6 * raw.length);
  const samples = raw.slice(start, end);
  const sampleStep = Math.max(1, Math.floor(samples.length / hillsBumps));
  const values = Array.from({ length: hillsBumps }, (_, i) =>
    processFftValue(samples[(i * sampleStep) % samples.length] ?? 0, minDb, maxDb),
  );

  // Layout: 15% horizontal padding so the curve doesn't kiss the edges.
  const pad = 0.15 * width;
  const stepSize = (width - 2 * pad) / Math.max(1, values.length - 1);

  const { vbShift, scaling } =
    hillsAlign === 'top'    ? { vbShift: -height, scaling: 1 }
  : hillsAlign === 'bottom' ? { vbShift: 0, scaling: 1 }
  :                           { vbShift: -height / 2, scaling: 0.5 };

  const hills = Array.from({ length: hillsCopies }, (_, lineIndex) => {
    const shifted = rotate(values, 3 * lineIndex);
    return shifted.map((v, i) => ({
      x: pad + i * stepSize,
      // Slight per-bump random multiplier (deterministic via seed) gives
      // the hills natural variation instead of identical waveforms.
      y:
        scaling * height * v *
        (1.2 - 0.5 * random(`${hillsSeed}-${lineIndex}-${i}`)),
    }));
  });

  const cp = 0.5 * stepSize;
  const buildPath = (line: { x: number; y: number }[], mirror: boolean) => {
    const sign = mirror ? -1 : 1;
    const segments = line.map((p, i, arr) => {
      const prev = i === 0 ? { x: 0, y: 0 } : arr[i - 1];
      return `C ${prev.x + cp} ${sign * prev.y}, ${p.x - cp} ${sign * p.y}, ${p.x} ${sign * p.y}`;
    });
    const last = line[line.length - 1];
    const tail = `C ${last.x + cp} ${sign * last.y}, ${width - cp} 0, ${width} 0`;
    return `M 0 0 ${segments.join(' ')} ${tail} Z`;
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${vbShift} ${width} ${height}`}
      style={{ display: 'block', color, filter: glow ? GLOW_FILTER : undefined }}
    >
      {hills.map((line, i) => {
        const pathProps = {
          fill: 'currentColor',
          fillOpacity: hillsFillOpacity / Math.max(1, hillsCopies - i),
          stroke: hillsStrokeWidth > 0 ? 'currentColor' : 'none',
          strokeWidth: hillsStrokeWidth,
        };
        return (
          <React.Fragment key={i}>
            {hillsAlign !== 'top' && <path d={buildPath(line, false)} {...pathProps} />}
            {hillsAlign !== 'bottom' && <path d={buildPath(line, true)} {...pathProps} />}
          </React.Fragment>
        );
      })}
    </svg>
  );
};

// ─── RADIAL ──────────────────────────────────────────────────────────

const RadialVariant: React.FC<V> = ({
  audioData, color, glow,
  radialDiameter, radialInnerRadius, radialBarWidth, radialBarGap, radialBarRadius, radialBarOrigin,
  minDb, maxDb, numberOfSamples,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const raw = visualizeAudio({ fps, frame, audioData, numberOfSamples });

  const radius = radialDiameter / 2;
  const innerR = clamp(radialInnerRadius, 0, radius - radialBarWidth);
  const maxBarHeight = radius - innerR;

  // Number of bars = circumference of the inner ring divided by bar slot.
  const slot = radialBarWidth + radialBarGap;
  const circumference = 2 * Math.PI * innerR;
  const nBars = Math.max(8, Math.floor(circumference / slot));

  // Use the upper half of the spectrum (high-pass) and mirror it so the
  // circle reads symmetrically — same trick Marcus's radial uses.
  const sampleStep = Math.max(1, Math.floor(raw.length / nBars));
  const halfBars = Array.from({ length: Math.floor(nBars / 2) }, (_, i) => {
    const v = raw[Math.floor(raw.length / 2) + (i * sampleStep) % Math.floor(raw.length / 2)] ?? 0;
    return processFftValue(v, minDb, maxDb);
  });
  const amplitudes = [...halfBars, ...halfBars.slice().reverse()];

  return (
    <svg
      width={radialDiameter}
      height={radialDiameter}
      viewBox={`0 0 ${radialDiameter} ${radialDiameter}`}
      style={{ display: 'block', color, filter: glow ? GLOW_FILTER : undefined }}
    >
      <defs>
        <linearGradient id="ondaRadialGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {amplitudes.map((v, i) => {
        const barHeight = Math.max(radialBarRadius * 2, v * maxBarHeight);
        const x = radius;
        // Position relative to the rotated coordinate system.
        const y =
          radialBarOrigin === 'outer' ? radius - barHeight
          : radialBarOrigin === 'inner' ? radius
          : radius - 0.5 * barHeight;
        const yOffset =
          radialBarOrigin === 'outer' ? radius
          : radialBarOrigin === 'inner' ? innerR
          : radius - 0.5 * (radius - innerR);
        const angle = (360 * i) / amplitudes.length;

        return (
          <rect
            key={i}
            x={x} y={y}
            width={radialBarWidth} height={barHeight}
            rx={radialBarRadius}
            fill="url(#ondaRadialGradient)"
            transform={`rotate(${angle} ${radius} ${radius}) translate(0 ${yOffset})`}
          />
        );
      })}
    </svg>
  );
};

export default AudioVisualizer;
