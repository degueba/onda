# Agent helpers

Three small lib exports for agent runtimes — JSON Schema for structured-output APIs, named canvas-dimension constants, and a registry summarizer that builds a system-prompt section from your installed components. Part of the [Composing with Onda](/docs/composing-with-onda) reference.

## `compositionJsonSchema` + `entryJsonSchema`

Drop-in JSON Schema versions of the Composition and Entry payloads. Use them with OpenAI structured output, Anthropic tool use, or any LLM call that consumes JSON Schema. The schema stays canonical — change `compositionSchema` (Zod), the JSON Schema updates on next import.

```bash
npx ondajs add lib-composition-json-schema
```

```ts
import { compositionJsonSchema } from './lib/onda/composition-json-schema';

// OpenAI structured output
const response = await openai.responses.create({
  model: 'gpt-5',
  input: prompt,
  text: { format: { type: 'json_schema', name: 'Composition', schema: compositionJsonSchema } },
});

// Anthropic tool use
const response = await anthropic.messages.create({
  model: 'claude-opus-4-7',
  tools: [{
    name: 'emit_composition',
    description: 'Emit an Onda composition payload',
    input_schema: compositionJsonSchema,
  }],
  messages: [{ role: 'user', content: prompt }],
});
```

Pulls `lib-composition` and requires `zod-to-json-schema` as a peer dep (the CLI prints the install line).

## `CANVAS_PRESETS` + `resolveCanvas`

Typed constants for the common video formats — no more hardcoded `1080×1920` in your renderer.

```bash
npx ondajs add lib-canvas-presets
```

```ts
import { CANVAS_PRESETS, resolveCanvas, type CanvasPreset } from './lib/onda/canvas-presets';

CANVAS_PRESETS.verticalSocial    // { width: 1080, height: 1920, fps: 30 }
CANVAS_PRESETS.horizontalSocial  // { width: 1920, height: 1080, fps: 30 }
CANVAS_PRESETS.square            // { width: 1080, height: 1080, fps: 30 }
CANVAS_PRESETS.portraitFeed      // { width: 1080, height: 1350, fps: 30 }
CANVAS_PRESETS.cinematic4k       // { width: 3840, height: 2160, fps: 24 }

// resolveCanvas accepts either a preset name OR explicit dims
resolveCanvas('verticalSocial')                       // { width: 1080, height: 1920, fps: 30 }
resolveCanvas({ width: 1440, height: 900 })           // { width: 1440, height: 900, fps: 30 }
resolveCanvas({ width: 1440, height: 900, fps: 60 }) // explicit fps
```

When the agent picks a format from a UI, normalize via `resolveCanvas`; when it custom-sizes, same call.

## `summarizeRegistry` + `summarizeRegistryAsMarkdown`

Walks your `ComponentRegistry` and produces either structured component metadata (your choice of format) or pre-formatted markdown (drop straight into a system prompt).

```bash
npx ondajs add lib-registry-summary
```

```ts
import { summarizeRegistry, summarizeRegistryAsMarkdown } from './lib/onda/registry-summary';
import { ondaRegistry } from './components/onda';

// Structured form — for custom formatting
const summary = summarizeRegistry(ondaRegistry);
// summary.components[0] = { name, description, supportsPlacement, supportsSize, keyProps: [...] }

// Markdown form — for system prompts
const promptSection = summarizeRegistryAsMarkdown(ondaRegistry);
```

Pulls `lib-composition-renderer` (for the `ComponentRegistry` type), which transitively pulls `lib-composition` and `lib-timing`. Requires `zod-to-json-schema` as a peer dep.

## Composed — agent runtime startup

The three helpers chain naturally during an agent runtime's initialization:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { compositionJsonSchema } from './lib/onda/composition-json-schema';
import { resolveCanvas, type CanvasPreset } from './lib/onda/canvas-presets';
import { summarizeRegistryAsMarkdown } from './lib/onda/registry-summary';
import { ondaRegistry } from './components/onda';

const SYSTEM_PROMPT = `
You compose Onda motion-graphics scenes. Emit a Composition payload using the emit_composition tool.

Available components:
${summarizeRegistryAsMarkdown(ondaRegistry)}
`;

async function generateComposition(userPrompt: string, format: CanvasPreset = 'verticalSocial') {
  const canvas = resolveCanvas(format);
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    system: SYSTEM_PROMPT,
    tools: [{
      name: 'emit_composition',
      description: 'Emit an Onda composition payload',
      input_schema: compositionJsonSchema as any,
    }],
    messages: [{ role: 'user', content: `${userPrompt}\n\nCanvas: ${canvas.width}×${canvas.height} @ ${canvas.fps}fps.` }],
  });
  // ... extract the tool_use payload, render via <CompositionRenderer>
}
```

Schema validation is the contract; canvas dims are typed constants; the system prompt auto-updates as you install more components.
