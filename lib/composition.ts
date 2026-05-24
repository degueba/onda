// Timeline-shape composition types and Zod schemas — the canonical agent
// payload format for multi-track Onda scenes.
//
// This is the on-the-wire shape Studio (and any other agent runtime or
// brief-driven renderer) emits and Onda's `<CompositionRenderer>` consumes.
// Keeping the types here means consumers don't transcribe them from prose
// in `docs/composing-with-onda.md` — they `import { compositionSchema }`
// and validate with a single `.parse()` call.
//
// See `docs/composing-with-onda.md` for worked examples and the
// payload-to-JSX rendering pattern. See `lib/timing.ts` for the time-spec
// vocabulary (`"0:04"` / `"30s"` / `90` / `"90f"`) accepted by `at` and `for`.

import { z } from 'zod';

/**
 * Time spec — accepts the same vocabulary as `lib/timing.ts`'s `toFrames()`:
 * `"M:SS"` / `"M:SS.ms"` (colon notation), `"Ns"` / `"Nms"` (suffixed seconds
 * or milliseconds), `"Nf"` (explicit frame counts), or a raw number of seconds.
 */
const timeSpecSchema = z.union([z.string(), z.number()]);

/**
 * A single beat on a track: when it plays, what plays, and with what props.
 *
 * `for` is intentionally a property name — reads conversationally as
 * `{ at: "0:02", for: "0:04" }`. JavaScript permits it as a property name
 * (only restricted as a variable / parameter name); access with dot notation
 * works fine. To destructure, alias: `const { at, for: dur } = entry;`.
 */
export const entrySchema = z.object({
  /**
   * When this beat starts in composition time, measured from the start of
   * the parent track's own timeline. Time-spec vocabulary.
   */
  at: timeSpecSchema,
  /**
   * How long this beat plays. Time-spec vocabulary.
   */
  for: timeSpecSchema,
  /**
   * PascalCase component name. Must match a key in the consumer's registry
   * passed to `<CompositionRenderer registry={...}>`; an unknown name
   * renders an error placeholder rather than crashing the composition.
   */
  component: z.string().min(1),
  /**
   * Props for the named component. Validated by that component's own Zod
   * schema at render time (the renderer looks the schema up via the
   * consumer's registry). Defaults to an empty object so agents can omit
   * `props` entirely for components that have premium defaults.
   */
  props: z.record(z.unknown()).default({}),
  /**
   * Optional stable identifier — useful for diffs, mutations, and matching
   * an entry across renders. Not used by the renderer itself.
   */
  id: z.string().optional(),
});

/** Inferred entry type. */
export type Entry = z.infer<typeof entrySchema>;

/**
 * A parallel layer of sequential beats. Tracks render bottom-to-top: the
 * first track in the `tracks` array sits behind everything that follows.
 *
 * Use multiple tracks for overlap (background plate + foreground beats);
 * use a single track for purely sequential scenes.
 */
export const trackSchema = z.object({
  /** Stable identifier — useful for diffs, mutations, and consumer UIs that need to refer back. */
  id: z.string().optional(),
  /**
   * Human-readable label (e.g. `"background"`, `"typography"`, `"sfx"`).
   * Ignored by the renderer; surfaces in consumer UIs.
   */
  label: z.string().optional(),
  /** Sequential beats on this track, each rendered inside a `<Sequence from={...}>`. */
  entries: z.array(entrySchema),
});

/** Inferred track type. */
export type Track = z.infer<typeof trackSchema>;

/**
 * The top-level composition payload — the on-the-wire shape an agent emits.
 *
 * The canvas envelope (`fps`, `width`, `height`) is composition-level; an
 * Onda component reads dimensions via `useVideoConfig()` and never has them
 * passed as props (see `Callout` / `Spotlight` for the pattern). `tracks`
 * are parallel layers; within each track, entries are sequential beats.
 *
 * @example
 * const payload: Composition = {
 *   fps: 30,
 *   width: 1080,
 *   height: 1920,
 *   tracks: [
 *     {
 *       label: 'background',
 *       entries: [{ at: 0, for: '0:08', component: 'GradientShift', props: {} }],
 *     },
 *     {
 *       label: 'typography',
 *       entries: [
 *         { at: '0:00', for: '0:03', component: 'TitleCard', props: { title: 'Hello' } },
 *         { at: '0:03', for: '0:05', component: 'StatCard',  props: { value: 1247 } },
 *       ],
 *     },
 *   ],
 * };
 */
export const compositionSchema = z.object({
  /** Composition frame rate. Typical: 30. */
  fps: z.number().positive(),
  /** Canvas width in pixels. */
  width: z.number().int().positive(),
  /** Canvas height in pixels. */
  height: z.number().int().positive(),
  /**
   * Total composition length in frames. Optional — consumers can derive
   * from track contents (`max(at + for)` across all entries, converted to
   * frames). When set, used directly as the `<Composition durationInFrames>`.
   */
  durationInFrames: z.number().int().positive().optional(),
  /** Parallel layers. First track sits behind; last sits on top. */
  tracks: z.array(trackSchema),
});

/** Inferred top-level composition type. */
export type Composition = z.infer<typeof compositionSchema>;
