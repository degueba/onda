import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

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
