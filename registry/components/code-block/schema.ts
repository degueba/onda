import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link CodeBlock} props. */
export const codeBlockSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('code-block').default('code-block'),
  /** The source to render. Newlines split into reveal-able lines. */
  code: z.string().default("const onda = motion('identity');\nexport default onda;"),
  /** Filename shown in the title bar. Empty hides the title (dots still show if chrome on). */
  title: z.string().default('onda.ts'),
  /** Show the macOS-style window chrome (three dots + title bar). */
  chrome: z.boolean().default(true),
  /** Reveal lines one-by-one instead of all at once. */
  revealLines: z.boolean().default(true),
  /** Frames before the first line appears. */
  delay: z.number().int().min(0).default(0),
  /** Frames between successive line reveals. */
  lineDelay: z.number().int().min(0).default(3),
  /** Monospace font stack. Real monospace by default — code needs column alignment. */
  fontFamily: z.string().default('ui-monospace, "SF Mono", Menlo, monospace'),
  /** Code font size in px. Sized for a 1080p+ video canvas, not a screen UI. */
  fontSize: z.number().default(48),
  /** Width in px. Auto if omitted. */
  width: z.number().optional(),
  /** Default text color — identifiers, punctuation, operators. */
  textColor: z.string().default('#E8E8EC'),
  /** Keyword color. A muted, dusty violet — reads as syntax, not the brand accent. */
  keywordColor: z.string().default('#B49DDD'),
  /** String literal color — dusty sage. */
  stringColor: z.string().default('#9DBE9A'),
  /** Comment color. */
  commentColor: z.string().default('var(--onda-faint, #56565F)'),
  /** Numeric literal color — dusty amber. */
  numberColor: z.string().default('#D6A87C'),
  /** JSX / HTML tag-name color — dusty cyan. Gives markup the variety a real editor theme has. */
  tagColor: z.string().default('#82B8C9'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link CodeBlock}. */
export type CodeBlockProps = z.infer<typeof codeBlockSchema>;
