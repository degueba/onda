import { z } from 'zod';

/** Zod schema for {@link depthPush} options. */
export const depthPushSchema = z.object({
  /** Direction the camera move travels. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /**
   * Amount of parallax scale. Outgoing scene scales down by this factor
   * as it pushes off; incoming scales from `1 + scaleAmount` toward 1.
   * Default `0.05` (5%) — subtle by design.
   */
  scaleAmount: z.number().min(0).max(0.3).default(0.05),
});

export type DepthPushOptions = z.input<typeof depthPushSchema>;
