import { z } from 'zod';

/** Zod schema for {@link glassWipe} options. */
export const glassWipeSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('glass-wipe').default('glass-wipe'),
  /** The direction the incoming scene wipes in from. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /** Peak frosted blur in px at the wipe edge — clears as the scene settles. */
  frost: z.number().min(0).max(40).default(12),
});

export type GlassWipeOptions = z.input<typeof glassWipeSchema>;
