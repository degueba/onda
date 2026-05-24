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
  /**
   * Accent color. Pass a single string for a one-tone visualizer, or an
   * array for multi-color treatments — bars/radial render a vertical
   * multi-stop gradient; wave/hills cycle through the array, one color
   * per stacked line / copy. Default is Onda's two-tone accent ramp
   * (rose → soft rose).
   */
  color: z
    .union([z.string(), z.array(z.string()).min(1)])
    .default(['#D96B82', '#E89AAB']),
  /** Add a soft accent glow via `drop-shadow`. */
  glow: z.boolean().default(true),

  /** Lower bound (dB) for FFT normalization. Anything below maps to 0. */
  minDb: z.number().default(-100),
  /** Upper bound (dB) for FFT normalization. Anything above maps to 1. */
  maxDb: z.number().default(-30),
  /** FFT bin count (power of two). 256 = dense, 64 = chunky. */
  numberOfSamples: z.number().int().default(256),

  // ── bars-only ───────────────────────────────────────────────────────
  // Each variant-specific prop carries an `only:<variant>` hint via
  // `.describe()`. Tooling (the docs-site TryIt popover; future agent
  // runtimes) can read these hints to hide / dim props that don't apply
  // to the current `variant` value. The hint is in JSON Schema's
  // `description` field, so it survives `zodToJsonSchema()` and is
  // visible to anything consuming the composition contract.
  /** Bar width in px. */
  barWidth: z.number().min(1).default(4).describe('only:bars'),
  /** Gap between bars in px. */
  barGap: z.number().min(0).default(4).describe('only:bars'),
  /** Corner radius for bars in px. */
  barRadius: z.number().min(0).default(2).describe('only:bars'),
  /** Vertical placement. */
  barAlign: z.enum(['top', 'middle', 'bottom']).default('middle').describe('only:bars'),

  // ── wave-only ───────────────────────────────────────────────────────
  /** Number of sine-wave sections across the width. */
  waveSections: z.number().int().min(2).default(12).describe('only:wave'),
  /** Number of stacked wave lines. */
  waveLines: z.number().int().min(1).default(2).describe('only:wave'),
  /** Vertical gap between stacked wave lines in px. */
  waveLineGap: z.number().min(0).default(16).describe('only:wave'),
  /** Stroke thickness of each wave line in px. */
  waveStrokeWidth: z.number().min(0.5).default(2).describe('only:wave'),
  /** Horizontal scroll speed in px/sec — wave drifts left as audio plays. */
  waveScrollSpeed: z.number().default(-160).describe('only:wave'),

  // ── hills-only ──────────────────────────────────────────────────────
  /** Number of bumps across the width. 8 reads natural. */
  hillsBumps: z.number().int().min(2).default(8).describe('only:hills'),
  /** Number of stacked hill copies for depth. */
  hillsCopies: z.number().int().min(1).default(2).describe('only:hills'),
  /** Vertical placement. `'middle'` mirrors above/below the centerline. */
  hillsAlign: z.enum(['top', 'middle', 'bottom']).default('middle').describe('only:hills'),
  /** Fill opacity for each hill copy. */
  hillsFillOpacity: z.number().min(0).max(1).default(0.4).describe('only:hills'),
  /** Stroke width for each hill copy. `0` = no outline. */
  hillsStrokeWidth: z.number().min(0).default(0).describe('only:hills'),
  /** Deterministic seed for the per-bump amplitude variation. */
  hillsSeed: z.union([z.number(), z.string()]).default(42).describe('only:hills'),

  // ── radial-only ─────────────────────────────────────────────────────
  /** Diameter of the radial visualizer in px. Overrides width/height. */
  radialDiameter: z.number().min(10).default(360).describe('only:radial'),
  /** Inner radius — bars start outside this ring. */
  radialInnerRadius: z.number().min(0).default(80).describe('only:radial'),
  /** Bar thickness in px. */
  radialBarWidth: z.number().min(1).default(4).describe('only:radial'),
  /** Gap between adjacent radial bars in px (along the ring). */
  radialBarGap: z.number().min(0).default(4).describe('only:radial'),
  /** Bar corner radius in px. */
  radialBarRadius: z.number().min(0).default(2).describe('only:radial'),
  /** Where each bar grows from: outward, inward, or centered on the ring. */
  radialBarOrigin: z.enum(['outer', 'inner', 'middle']).default('inner').describe('only:radial'),

  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link AudioVisualizer}. */
export type AudioVisualizerProps = z.infer<typeof audioVisualizerSchema>;

/**
 * Curated "known good" preset configurations — named visual personalities
 * that show off what's possible without forcing the consumer to wade
 * through every prop. Each preset is a `Partial<AudioVisualizerProps>` you
 * spread onto the component: `<AudioVisualizer {...audioVisualizerPresets.aurora} />`.
 *
 * Exported as first-class data (not preview-only metadata) so:
 *   - the docs site renders them as a chip row in the live preview's TryIt panel
 *   - agents picking a preset by name is simpler than guessing prop combos
 *   - downstream consumers (Studio, brief renderers) can offer the same set
 *
 * Color story: rose (`#D96B82`) is always the anchor — Onda's brand
 * accent — paired with a different complementary color per preset for
 * visual personality. The WOW palette additions (cyan / violet / amber)
 * live LOCAL to the visualizer, not in the brand tokens — visualizers
 * are an earned-color moment where bolder pairings earn their place.
 */
export const audioVisualizerPresets = {
  /** Spotify-style: chunky bars, single rose accent, middle-aligned. */
  spotify: {
    variant: 'bars',
    barWidth: 12,
    barGap: 8,
    barAlign: 'middle',
    color: '#D96B82',
  },
  /** SoundCloud-style: dense thin bars, rose → cyan complement. */
  soundcloud: {
    variant: 'bars',
    barWidth: 2,
    barGap: 1,
    barAlign: 'middle',
    color: ['#D96B82', '#4DD4D8'],
  },
  /** Bottom-anchored equalizer bars — classic DJ look, two-tone rose. */
  equalizer: {
    variant: 'bars',
    barWidth: 6,
    barGap: 4,
    barAlign: 'bottom',
    color: ['#D96B82', '#E89AAB'],
  },
  /** Aurora hills — three-tone layered fills, rose / violet / soft rose. */
  aurora: {
    variant: 'hills',
    hillsCopies: 3,
    hillsFillOpacity: 0.5,
    color: ['#D96B82', '#7C5CE5', '#E89AAB'],
  },
  /** Voice ribbon — four stacked wave lines, rose ↔ cyan, slow drift. */
  voice: {
    variant: 'wave',
    waveLines: 4,
    waveLineGap: 18,
    waveScrollSpeed: -100,
    color: ['#D96B82', '#4DD4D8'],
  },
  /** Sunburst — radial bars outward, amber ↔ rose (warm). */
  sunburst: {
    variant: 'radial',
    radialBarOrigin: 'outer',
    radialBarWidth: 6,
    radialBarGap: 4,
    color: ['#FFB547', '#D96B82'],
  },
  /** Neon ring — radial bars inward, rose ↔ violet (synthwave). */
  neon: {
    variant: 'radial',
    radialBarOrigin: 'inner',
    radialInnerRadius: 120,
    radialBarWidth: 4,
    color: ['#D96B82', '#7C5CE5'],
  },
} as const satisfies Record<string, Partial<AudioVisualizerProps>>;

export type AudioVisualizerPreset = keyof typeof audioVisualizerPresets;

// Drop-shadow string used when `glow` is on. Tuned for a soft accent halo.
const GLOW_FILTER = 'drop-shadow(0 0 6px currentColor)';

/** Normalize a `string | string[]` color prop to a non-empty array. */
const toColorArray = (c: string | string[]): string[] =>
  Array.isArray(c) ? (c.length > 0 ? c : ['#D96B82']) : [c];

/** Pick a color by index, wrapping. */
const colorAt = (colors: string[], i: number) => colors[i % colors.length];

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

  // Multi-stop vertical gradient. Each color in the array becomes a stop;
  // evenly distributed. With one color, the gradient fades to 30% alpha
  // at the bottom (soft glow effect). With multiple colors, the array
  // drives the stops (no alpha fade — the colors carry the visual).
  const colors = toColorArray(color);
  const stops = colors.length === 1
    ? [
        { offset: '0%', color: colors[0], opacity: 1 },
        { offset: '100%', color: colors[0], opacity: 0.3 },
      ]
    : colors.map((c, i) => ({
        offset: `${(i / (colors.length - 1)) * 100}%`,
        color: c,
        opacity: 1,
      }));

  // Use the first color for the glow tint (drop-shadow only takes one).
  const tintColor = colors[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        color: tintColor,
        filter: glow ? GLOW_FILTER : undefined,
      }}
    >
      <defs>
        <linearGradient id="ondaBarGradient" x1="0" y1="0" x2="0" y2="1">
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
          ))}
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

  // Cycle the color array across stacked lines. With a single color,
  // every line is the same hue and we apply opacity decay so the layers
  // read as one ribbon. With multiple colors, each line gets its own
  // hue — no opacity decay so each color is fully present.
  const colors = toColorArray(color);
  const tintColor = colors[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${-height / 2} ${width} ${height}`}
      style={{ display: 'block', color: tintColor, filter: glow ? GLOW_FILTER : undefined }}
    >
      {lines.map((d, i) => (
        <path
          key={i} d={d}
          stroke={colorAt(colors, i)}
          strokeWidth={waveStrokeWidth}
          strokeLinecap="round"
          strokeOpacity={colors.length === 1 ? 1 - i * 0.25 : 1}
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

  // Cycle the color array across stacked copies.
  const colors = toColorArray(color);
  const tintColor = colors[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${vbShift} ${width} ${height}`}
      style={{ display: 'block', color: tintColor, filter: glow ? GLOW_FILTER : undefined }}
    >
      {hills.map((line, i) => {
        const fillColor = colorAt(colors, i);
        const pathProps = {
          fill: fillColor,
          fillOpacity: hillsFillOpacity / Math.max(1, hillsCopies - i),
          stroke: hillsStrokeWidth > 0 ? fillColor : 'none',
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

  // Multi-stop gradient — same pattern as bars but oriented along the
  // bar's height (outward from the ring). Each color becomes a stop.
  const colors = toColorArray(color);
  const stops = colors.length === 1
    ? [
        { offset: '0%', color: colors[0], opacity: 1 },
        { offset: '100%', color: colors[0], opacity: 0.4 },
      ]
    : colors.map((c, i) => ({
        offset: `${(i / (colors.length - 1)) * 100}%`,
        color: c,
        opacity: 1,
      }));
  const tintColor = colors[0];

  return (
    <svg
      width={radialDiameter}
      height={radialDiameter}
      viewBox={`0 0 ${radialDiameter} ${radialDiameter}`}
      style={{ display: 'block', color: tintColor, filter: glow ? GLOW_FILTER : undefined }}
    >
      <defs>
        <linearGradient id="ondaRadialGradient" x1="0" y1="0" x2="0" y2="1">
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
          ))}
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
