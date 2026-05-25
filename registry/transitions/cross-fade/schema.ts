import { z } from 'zod';

/**
 * Zod schema for {@link crossFade} options.
 *
 * Mirrors the relevant subset of Remotion's `FadeProps`. Onda doesn't
 * expose `enterStyle` / `exitStyle` here — overriding the per-scene CSS
 * defeats the "the cut feels Onda" promise. Users who need that level
 * of override can wrap their own factory.
 */
export const crossFadeSchema = z.object({
  /**
   * Whether the exiting scene fades to transparent during the
   * transition. Default `true` — the eye sees both scenes briefly
   * dissolving into each other.
   *
   * Set `false` for a "fade through" look where the incoming scene
   * simply rises in over the held outgoing one.
   */
  shouldFadeOutExitingScene: z.boolean().default(true),
});

/**
 * Options accepted by {@link crossFade}. Use the `input` type (not
 * `infer`) so defaulted fields are optional at the call site.
 */
export type CrossFadeOptions = z.input<typeof crossFadeSchema>;
