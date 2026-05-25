import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link BrowserFrame} props. */
export const browserFrameSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('browser-frame').default('browser-frame'),
  /** URL shown in the address pill. */
  url: z.string().default('onda.video'),
  /** Optional screenshot/image URL to show inside the frame when no children are passed. */
  src: z.string().optional(),
  /** Frames before the entrance. */
  delay: z.number().int().min(0).default(0),
  /** Scale-and-fade the frame in on the house spring. */
  animate: z.boolean().default(true),
  /** Frame width in px. Sized to fill a good portion of a 1080p+ canvas. */
  width: z.number().default(1280),
  /** Content height in px (excludes the chrome bar). */
  height: z.number().default(720),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link BrowserFrame}. */
export type BrowserFrameProps = z.infer<typeof browserFrameSchema>;
