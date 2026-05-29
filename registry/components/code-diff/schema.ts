import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** A single diff line. */
export const diffLineSchema = z.object({
  /** The line text (no leading +/−; the gutter adds it). */
  text: z.string().default(''),
  /** Line kind — drives gutter symbol, color, and treatment. */
  type: z.enum(['add', 'remove', 'context']).default('context'),
});

/** Zod schema for {@link CodeDiff} props. */
export const codeDiffSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('code-diff').default('code-diff'),
  /** The diff lines, top to bottom. */
  lines: z.array(diffLineSchema).default([
    { text: "const onda = motion('default');", type: 'remove' },
    { text: "const onda = motion('identity');", type: 'add' },
    { text: 'export default onda;', type: 'context' },
  ]),
  /** Filename shown in the title bar. */
  title: z.string().default('motion.ts'),
  /** Show window chrome (dots + title bar). */
  chrome: z.boolean().default(true),
  /** Reveal lines one-by-one. */
  revealLines: z.boolean().default(true),
  /** Frames before the first line appears. */
  delay: z.number().int().min(0).default(0),
  /** Frames between line reveals. */
  lineDelay: z.number().int().min(0).default(4),
  /** Monospace font stack. */
  fontFamily: z.string().default('ui-monospace, "SF Mono", Menlo, monospace'),
  /** Code font size in px. */
  fontSize: z.number().default(44),
  /** Width in px. Auto if omitted. */
  width: z.number().optional(),
  /** Default (context) text color. */
  textColor: z.string().default('var(--onda-dim, #8E8E98)'),
  /** Added-line color. */
  addColor: z.string().default('#7FB58C'),
  /** Removed-line color. */
  removeColor: z.string().default('#D08C8C'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link CodeDiff}. */
export type CodeDiffProps = z.infer<typeof codeDiffSchema>;
