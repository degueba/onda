// Timeline-shape composition payload — the on-the-wire shape an agent emits.
// See `docs/composing-with-onda.md` for examples and `composition-renderer.tsx`
// for the canonical renderer.

import { z } from 'zod';

const timeSpecSchema = z.union([z.string(), z.number()]);

/**
 * `for` is intentionally a property name (reads as `{ at: '0:02', for: '0:04' }`).
 * JS permits it as a property — only restricted as a variable / parameter name.
 * Destructure with `const { at, for: dur } = entry`.
 */
export const entrySchema = z.object({
  at: timeSpecSchema,
  for: timeSpecSchema,
  component: z.string().min(1),
  props: z.record(z.unknown()).default({}),
  id: z.string().optional(),
});

export type Entry = z.infer<typeof entrySchema>;

export const trackSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  entries: z.array(entrySchema),
});

export type Track = z.infer<typeof trackSchema>;

/**
 * `tracks` are parallel layers — first track sits behind, last sits on top.
 * Within a track, entries are sequential beats placed via `<Sequence from={…}>`.
 */
export const compositionSchema = z.object({
  fps: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationInFrames: z.number().int().positive().optional(),
  tracks: z.array(trackSchema),
});

export type Composition = z.infer<typeof compositionSchema>;
