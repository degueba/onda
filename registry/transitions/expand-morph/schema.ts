import { z } from 'zod';

/** Zod schema for {@link expandMorph} options. */
export const expandMorphSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('expand-morph').default('expand-morph'),
  /** Origin rect left edge as a 0..1 fraction of the canvas width. */
  fromX: z.number().min(0).max(1).default(0.375),
  /** Origin rect top edge as a 0..1 fraction of the canvas height. */
  fromY: z.number().min(0).max(1).default(0.375),
  /** Origin rect width as a 0..1 fraction of the canvas width. */
  fromWidth: z.number().min(0).max(1).default(0.25),
  /** Origin rect height as a 0..1 fraction of the canvas height. */
  fromHeight: z.number().min(0).max(1).default(0.25),
  /** Border radius (px) of the card at its small origin size. */
  borderRadiusFrom: z.number().min(0).max(200).default(20),
  /** Border radius (px) of the card once it fills the screen. */
  borderRadiusTo: z.number().min(0).max(200).default(0),
  /** Fill behind the morphing card while it expands. */
  background: z.string().default('#08080A'),
});

export type ExpandMorphOptions = z.input<typeof expandMorphSchema>;
