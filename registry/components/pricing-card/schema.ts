import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link PricingCard} props. */
export const pricingCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('pricing-card').default('pricing-card'),
  /** Tier name above the price (e.g. `'Pro'`). */
  tier: z.string().default('Pro'),
  /** The headline price, rendered large (display font). Free-form so you can pass `'$29'`, `'€19'`, or `'Free'`. */
  price: z.string().default('$29'),
  /** Billing period beneath the price (e.g. `'/month'`). Empty hides it. */
  period: z.string().default('/month'),
  /** Feature checklist — each item gets an accent checkmark. */
  features: z.array(z.string()).default([
    'Unlimited renders',
    'Signature motion identity',
    'Source you own, copied in',
    'Priority support',
  ]),
  /** Call-to-action button label. */
  cta: z.string().default('Get started'),
  /** Lifts + scales the card and shows an accent badge — the highlighted tier. */
  recommended: z.boolean().default(false),
  /** The earned accent — checkmarks, badge, CTA, recommended glow. Defaults to `--onda-accent`. */
  accent: z.string().default('#D96B82'),
  /** Frames before the card enters. */
  delay: z.number().int().min(0).default(0),
  /** Card width in px. Wins over `size` if both are passed. */
  width: z.number().default(380),
  /** Semantic role for the price type — resolves to canvas-aware pixels. Overrides the price font size when set. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link PricingCard}. */
export type PricingCardProps = z.infer<typeof pricingCardSchema>;
