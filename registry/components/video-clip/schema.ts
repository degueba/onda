import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

const timeSpec = z.union([z.string(), z.number()]);

/** Zod schema for {@link VideoClip} props. */
export const videoClipSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('video-clip').default('video-clip'),
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
