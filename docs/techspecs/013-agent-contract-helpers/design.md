# Techspec 013 — Agent contract helpers

## Problem

After 008 / 010 / the composition payload + renderer, the lib's component contract is in good shape and an agent runtime *can* render Onda compositions. But three concrete gaps surface when wiring an actual LLM-driven agent (Studio's eventual real runtime, or any third party):

1. **No JSON Schema export of the Composition payload.** OpenAI structured-output and Anthropic tool-use both consume JSON Schema. Today an agent runtime would have to convert `compositionSchema` (Zod) to JSON Schema themselves, and re-do it every time the schema evolves. The schema is lib's — its JSON Schema form should be lib's too.
2. **No typed canvas-dimension constants.** Studio (and any other renderer) hand-codes `1080×1920` / `1920×1080` per format. Lib already owns `DURATION`, `STAGGER`, `COLOR`, `FONT`, `SPACING` — canvas dimensions belong in the same tokens layer.
3. **No registry-introspection helper.** An agent that wants to feed "here are the available components and their props" into a system prompt has to walk the `ComponentRegistry` map manually, extracting names + categories + key props from each `meta.json` + Zod schema. Every agent runtime hits this; the introspection logic belongs next to the registry shape it walks.

None of these block existing consumers — but each forces every agent runtime to re-derive what the lib already knows. Shipping them flips the chain from "consumer rebuilds the contract" to "lib exports the contract."

## Decision

Ship three small additions, bundled as one PR. Pure additions, no breaking changes, no new runtime surface to maintain over time (each helper is a thin shim over data the lib already owns).

### 1. `compositionJsonSchema` + `entryJsonSchema`

New file `lib/composition-json-schema.ts`. Re-exports the Zod schemas from `lib/composition.ts` converted to JSON Schema via [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema) (battle-tested; one peer dep).

```ts
import { zodToJsonSchema } from 'zod-to-json-schema';
import { compositionSchema, entrySchema } from './composition';

export const compositionJsonSchema = zodToJsonSchema(compositionSchema, 'Composition');
export const entryJsonSchema = zodToJsonSchema(entrySchema, 'Entry');
```

Agent runtimes drop this into their LLM call's `response_format` / `tools` config. The schema stays canonical — change `compositionSchema`, the JSON Schema updates automatically on next import.

CLI manifest: `lib-composition-json-schema` with `peerDependencies: ['zod-to-json-schema']` and `registryDependencies: ['lib-composition']`. Users who don't need JSON Schema just don't install this helper.

### 2. `CANVAS_PRESETS`

New file `lib/canvas-presets.ts`. Named constants for the common video formats, each `{ width, height, fps }`:

```ts
export const CANVAS_PRESETS = {
  /** Vertical social — TikTok, Reels, Shorts. The Studio default. */
  verticalSocial:   { width: 1080, height: 1920, fps: 30 },
  /** Horizontal social — YouTube landscape, X feed. */
  horizontalSocial: { width: 1920, height: 1080, fps: 30 },
  /** Square — Instagram feed, LinkedIn. */
  square:           { width: 1080, height: 1080, fps: 30 },
  /** Portrait feed — Instagram 4:5. */
  portraitFeed:     { width: 1080, height: 1350, fps: 30 },
  /** Cinematic 4K — hero / premium. 24fps for film feel. */
  cinematic4k:      { width: 3840, height: 2160, fps: 24 },
} as const;

export type CanvasPreset = keyof typeof CANVAS_PRESETS;

/** Resolve either a named preset or an explicit `{width, height, fps?}` to canonical form. */
export function resolveCanvas(
  spec: CanvasPreset | { width: number; height: number; fps?: number },
): { width: number; height: number; fps: number };
```

`resolveCanvas` lets agents pass either form. CLI manifest: `lib-canvas-presets` with no peer or registry deps — pure constants.

### 3. `summarizeRegistry` + `summarizeRegistryAsMarkdown`

New file `lib/registry-summary.ts`. Two helpers over a `ComponentRegistry`:

```ts
export type RegistrySummary = {
  components: Array<{
    name: string;
    description?: string;
    supportsPlacement: boolean;
    supportsSize: boolean;
    keyProps: Array<{
      name: string;
      type: string;       // Zod-inferred (e.g. "string", "number", "Placement", "'left' | 'right'")
      required: boolean;
      default?: unknown;
      description?: string;
    }>;
  }>;
};

/** Structured summary. Agents that format their own way (markdown, YAML, custom) use this. */
export function summarizeRegistry(registry: ComponentRegistry): RegistrySummary;

/** Pre-formatted markdown, ready to paste into a system prompt. The 80% case. */
export function summarizeRegistryAsMarkdown(registry: ComponentRegistry): string;
```

Reads from each registry entry's Zod schema's `_def` to extract prop shapes and defaults; reads `supportsPlacement` / `supportsSize` by checking for `placement` / `size` keys on the schema. Reads `description` from the schema's `.describe()` annotations when present.

CLI manifest: `lib-registry-summary` with `registryDependencies: ['lib-composition-renderer']` (which transitively pulls in `lib-composition` for the `ComponentRegistry` type).

## Goals

1. Agent runtimes can feed `compositionJsonSchema` to OpenAI structured output / Anthropic tool-use with one import.
2. Canvas dimensions are typed constants — no more hardcoded `1080 / 1920` per consumer.
3. Building a "here's what's available" system prompt from a registry takes one function call.
4. All three helpers are CLI-installable, peer-dep-explicit, and don't change anything that already ships.
5. Zero breaking changes to existing components, schemas, or CLI behavior.

## Non-goals

- **Pre-computed / static JSON Schema** baked into the lib at build time. The runtime conversion via `zod-to-json-schema` is small, fast, and stays in sync automatically. A pre-compute step adds build machinery for no perceptible win.
- **`<CompositionRenderer partial />`** for streaming agents. Studio isn't streaming yet; defer until concrete demand.
- **YAML / custom format summarization** — `summarizeRegistry` returns structured; `summarizeRegistryAsMarkdown` handles the common case. Other formats are caller's job.
- **Per-component example payloads** (the "playgroundPresets" idea) — that's distinct from whole-composition demo payloads (Studio's ask #4) and deserves its own design. Both could ship later.
- **Canvas presets for non-video formats** (print, web embeds). Out of scope; lib is for Remotion video.
- **Adding `style` / `className` props to components.** Explicitly rejected — see [`docs/composing-with-onda.md`](../../composing-with-onda.md) and the no-style-escape-hatch rationale: motion identity is the moat; escape hatches let users break it accidentally. Customization paths: typed props (primary), external wrapper (secondary), fork the installed file (when neither covers it).

## Reasonable calls (challenge any)

- **`zod-to-json-schema` as a peer dep** vs vendoring the conversion: peer dep wins. Battle-tested library, ~6kB, narrow API surface, the maintainer keeps up with Zod schema-shape evolutions. Vendoring would mean tracking Zod-internal changes ourselves — pure YAGNI.
- **Two functions for registry summary** (`structured` + `as markdown`) vs one with a `format` enum: two named functions. Each call site picks the one it needs; no string-enum branching at the boundary; types are tighter.
- **`CANVAS_PRESETS` as five entries, not exhaustive**: covers the 80% — TikTok/Reels/Shorts vertical, YouTube horizontal, IG square, IG portrait 4:5, cinematic 4K. Adding more (Twitter video, Pinterest, banners) is consumer's job until concrete demand. KISS.
- **`resolveCanvas` accepts both named-preset and raw `{width, height, fps?}`**: makes agent integration ergonomic — when the agent picks a preset name from a UI, lib normalizes; when the agent custom-sizes, lib normalizes. One contract, two ergonomics.
- **Separate `lib-*` manifest per helper** vs bundling: separate. Consumers should pull only what they need; `lib-canvas-presets` (no peer deps) shouldn't force `zod-to-json-schema` install on consumers who never call JSON Schema export.
- **`summarizeRegistry` reads from Zod's `_def`** (internal API): yes. This is the same access pattern `zod-to-json-schema` uses and the lib's existing `safeParse` paths rely on shape. If Zod's internal shape changes, both `zod-to-json-schema` and our summary helper need updates — but they update together.

## Open questions deferred

- **Should `summarizeRegistry` also include category / tags from `meta.json`?** Today the helper only knows about the component name + its Zod schema (passed via the registry). It can't read meta.json without a separate file-system lookup or an extended registry shape. Could ship an extended `ComponentRegistry` form that includes meta when available; defer until a consumer reaches for it.
- **Pre-canned demo compositions** (Studio's ask #4) as a follow-up techspec. Distribution decision (CLI install vs static JSON) needs its own design pass. Worth tracking as 014 or similar.
- **Streaming `<CompositionRenderer partial />`** when Studio's real agent ships. Forward, optional.
- **`canvas-presets` synonyms / aliases** (`'tiktok'`, `'reels'` etc.) for human-friendly naming. Tempting; risk of bikeshedding. Defer.
