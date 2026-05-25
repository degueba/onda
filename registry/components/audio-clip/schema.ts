import { z } from 'zod';

const timeSpec = z.union([z.string(), z.number()]);

/** Zod schema for {@link AudioClip} props. */
export const audioClipSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('audio-clip').default('audio-clip'),
  /** URL or path to the audio file. AAC-in-MP4 or WAV preferred (see README format hints). */
  src: z.string().default('https://www.w3schools.com/html/horse.mp3'),
  /**
   * Where to start in the **source audio**. Time spec — accepts `"0:04"`,
   * `"30s"`, `"500ms"`, `"90f"`, or a raw number of seconds.
   */
  startAt: timeSpec.default(0),
  /**
   * Where to stop in the source. Same time spec as `startAt`. When omitted,
   * the clip plays to the source's end. Required for `loop: true`.
   */
  endAt: timeSpec.optional(),
  /** Amplitude volume `0..1`. */
  volume: z.number().min(0).max(1).default(1),
  /**
   * Advanced gain in dB. When set, wins over `volume`. Sound designers think
   * in dB; agents pick `volume` from a 0..1 UI. Converted via `10 ** (dB / 20)`.
   * Examples: `0` = unity (1.0), `-6` ≈ 0.5, `-12` ≈ 0.25, `-20` ≈ 0.1.
   */
  gainDb: z.number().optional(),
  /**
   * Apply an entry/exit volume envelope. Default `true` with a tiny 2-frame
   * fade — imperceptible, prevents start/end clicks most codecs introduce.
   * Set larger `fadeDuration` for audible bed fades. Set `fade: false` only
   * inside crossfade primitives that own the envelope.
   */
  fade: z.boolean().default(true),
  /** Frames the fade-in / fade-out takes. Default 2 (~67ms @ 30fps). */
  fadeDuration: z.number().int().min(0).default(2),
  /**
   * Loop the trimmed clip. Requires `endAt` to be set (loop interval is
   * `endAt - startAt`). When looping, fade-out is auto-disabled — there's
   * no defined end until the parent `<Sequence>` terminates.
   */
  loop: z.boolean().default(false),
  /** Mute the clip. */
  muted: z.boolean().default(false),
  /** Playback speed. Browser-clamped 0.0625..16. */
  playbackRate: z.number().min(0.0625).max(16).default(1),
  /**
   * Acceptable time-shift threshold before Remotion resyncs (seconds).
   * Default `0.1` — tighter than Remotion's own 0.45 default because Onda
   * compositions are usually beat-locked.
   */
  acceptableTimeShiftSeconds: z.number().min(0).default(0.1),
});

/** Inferred props for {@link AudioClip}. */
export type AudioClipProps = z.infer<typeof audioClipSchema>;
