# Techspec 021 — `kind` discriminator on every schema

> Tracks [#27](https://github.com/degueba/onda/issues/27).

## Problem

Onda exposes per-component Zod schemas (`blurRevealSchema`, `crossFadeSchema`, etc.) and now ships them as a runtime manifest (techspec 018). A consumer building a JSON-driven render runtime — Studio, agent layer vocabulary, brief validator — wants to compose those schemas into a single `z.discriminatedUnion('kind', [...])` covering every possible layer kind. Today they can't: the schemas have no built-in discriminator, so consumers wrap every onda schema externally:

```ts
const TypewriterLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("typewriter"),
  props: typewriterSchema,
}).strict();
// …repeat for every onda component the consumer supports
```

That mirror drifts when onda adds a new component (consumer forgets to add a new wrapper), it adds boilerplate scale-linear with the catalog, and it duplicates the slug the registry already canonicalizes.

## Decision

Bake `kind: z.literal('<slug>').default('<slug>')` as the first field of every component and transition schema. The literal value matches the entry's registry slug (kebab-case, same as `meta.json` `name`).

Non-breaking variant chosen (`.default('<slug>')`) per the issue's "alternative" path — `schema.parse({})` continues to work and auto-populates `kind`. JSX-callsite types do gain a required `kind` field via `z.infer`, which the internal composer components now pass explicitly (see "Migration" below).

After this, a consumer can drop the wrapping pattern entirely:

```ts
import { manifest } from 'ondajs';
import { z } from 'zod';

const OndaLayer = z.discriminatedUnion('kind',
  manifest
    .filter(e => e.category !== 'transitions')
    .map(e => e.schema),
);

function render(layer: z.infer<typeof OndaLayer>) {
  switch (layer.kind) {
    case 'typewriter':  return <Typewriter {...layer} />;
    case 'quote-card':  return <QuoteCard {...layer} />;
    // exhaustively typed
  }
}
```

## Goals

- Every onda component + transition schema self-identifies its kind via `z.literal('<slug>')`
- Consumers can build `z.discriminatedUnion('kind', manifest.map(e => e.schema))` directly — no per-entry wrapping
- `schema.parse({})` continues to work without `kind` (auto-populated via default)
- The discriminator value is the canonical registry slug — single source of truth for the entry's identity

## Non-goals

- **Not adding `type` or other naming variants** — `kind` is the TypeScript-community convention for discriminated unions.
- **Not adding runtime cross-validation** that the discriminator matches the registry slug — Zod's `z.literal()` handles that at type level; the codemod ensures the literal matches the folder name; the slugs already live in `meta.json` and aren't separately drifting.
- **Not breaking `<Component>` JSX callsites for external consumers** — but see the migration note: a callsite passing props directly (not via `{...schema.parse({...})}` spread) gains a required `kind` field at the TypeScript level. The .parse path stays zero-migration.

## Migration

Internal composer components (`TitleCard`, `ChapterCard`, `EndCard`, `LogoSting`, `LowerThird`, `QuoteCard`, `StatCard`) JSX-render other Onda components by passing props directly. After this change those callsites need a `kind="<slug>"` attribute. Updated as part of this PR via codemod (`scripts/inject-kind-jsx.mjs`).

External consumers using `<Component {...schema.parse({...})} />` pattern continue to work without change — `schema.parse({})` auto-populates `kind` via the default.

External consumers using `<Component text="..." delay={5} />` pattern (passing props directly) gain a required `kind` field. Mechanical migration: add `kind="<slug>"` to each call site.

## Reasonable calls (challenge any)

- **Default to slug, not require-and-validate.** Using `.default('<slug>')` over a bare `z.literal('<slug>')` makes `schema.parse({})` non-breaking. The breaking variant (required `kind`) is cleaner semantically but burns migration cost for every external consumer's existing call sites. Pre-1.0 we could afford the break; we just don't need to.
- **`kind` as the FIRST field.** Position matters for readability in the generated dist/manifest.js bundle — the discriminator is the most identifying property of a schema, so it sits at the top. Also matches the convention in `z.discriminatedUnion` typings.
- **Verbose JSDoc per field.** Each generated `kind` field carries a long JSDoc explaining the auto-population behavior and the discriminated-union use case. Worth the bytes — the manifest is consumed by LLMs, and explicit semantics in the schema doc are part of the surface.
- **Slug source: file system, not `meta.json`.** The codemod derives the slug from the component folder name. `meta.json` `name` is hand-maintained and could drift; folder name is structural. Both should always match, but folder-derived is the more reliable single source for code generation.

## Implementation

Two one-time codemods land in this PR (kept under `scripts/` for historical reference and future reuse):

- `scripts/add-kind-discriminator.mjs` — TS-compiler-API codemod that walks every `schema.ts` and injects the `kind` field at the top of the `z.object({...})` literal. Idempotent (skips if already present).
- `scripts/inject-kind-jsx.mjs` — TS-compiler-API codemod that walks composer components, finds JSX calls to Onda components, and prepends `kind="<slug>"` when absent. Idempotent.

Manifest impact: `ondajs/manifest`'s every entry now exposes a schema whose first field is the kind literal. Downstream consumers see this on next bump.

## Open questions

None known. Codemod is mechanical, deterministic, and the smoke-test confirmed `schema.parse({}).kind === slug` for 52 of 54 entries (the two exceptions — `clock-wipe` and `iris` — have required `width`/`height` fields that make `parse({})` throw, unrelated to `kind`; the discriminator is still present in their `schema._def.shape().kind`).
