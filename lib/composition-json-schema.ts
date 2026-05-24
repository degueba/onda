// Composition + Entry as JSON Schema — for LLM structured-output / tool-use.
// See `docs/composing-with-onda.md` for the full payload contract.

import { zodToJsonSchema } from 'zod-to-json-schema';
import { compositionSchema, entrySchema } from './composition';

export const compositionJsonSchema = zodToJsonSchema(compositionSchema, 'Composition');
export const entryJsonSchema = zodToJsonSchema(entrySchema, 'Entry');
