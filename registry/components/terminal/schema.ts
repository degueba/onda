import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Terminal} props. */
export const terminalSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('terminal').default('terminal'),
  /** The command that types itself out after the prompt. */
  command: z.string().default('npx ondajs add code-block'),
  /** Output lines that appear, staggered, once the command finishes typing. */
  output: z.array(z.string()).default(['✓ added code-block', '✓ wrote 4 files']),
  /** The shell prompt glyph. */
  prompt: z.string().default('$'),
  /** Title-bar label. Empty hides it (dots still show if chrome on). */
  title: z.string().default('zsh'),
  /** Show window chrome (dots + title bar). */
  chrome: z.boolean().default(true),
  /** Frames before typing starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to type the whole command. */
  typeSpeed: z.number().int().min(1).default(30),
  /** Frames after the command finishes before output begins. */
  outputDelay: z.number().int().min(0).default(8),
  /** Monospace font stack. */
  fontFamily: z.string().default('ui-monospace, "SF Mono", Menlo, monospace'),
  /** Font size in px. Sized for a 1080p+ video canvas, not a screen UI. */
  fontSize: z.number().default(48),
  /** Width in px. Fixed by default so the terminal frame is stable while the
   * command types into it — a terminal has a defined size, it doesn't grow
   * character by character. */
  width: z.number().default(1100),
  /** Command text color. */
  textColor: z.string().default('#F2F2F4'),
  /** Prompt glyph color — the earned accent. */
  promptColor: z.string().default('#D96B82'),
  /** Output line color. */
  outputColor: z.string().default('#8E8E98'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Terminal}. */
export type TerminalProps = z.infer<typeof terminalSchema>;
