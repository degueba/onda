# Techspec 018 — Runtime manifest export

> Tracks [#21](https://github.com/degueba/onda/issues/21).

## Problem

Onda ships component metadata in two places today: `registry/registry.json` (catalog listing with name, category, title, description) and each component's `schema.ts` (the Zod schema for its props). Both exist, but neither is reachable from consuming code at runtime — `registry.json` requires a filesystem read, and the schemas are buried in unimported files. Consumers building anything programmatic on top of onda — LLM-driven render runtimes, agent layer vocabularies, brief-driven Studios, training-data pipelines — have to hand-mirror every component's schema into their own project. That mirror silently goes stale when onda adds a prop (the recent `placement` rollout is the canonical example), and new onda components don't propagate to the consumer until someone manually adds a layer kind.

The ask is a single runtime import — `import { manifest } from 'ondajs'` — returning a typed array of every component with its name, category, title, description, Zod schema, and optional examples. The data already exists; we just need to expose it as a build-generated, package-exported entry point so consumers stop mirroring and stay in sync automatically.

## Decision

Ship `import { manifest } from 'ondajs'` as a flat `ReadonlyArray<ComponentManifestEntry>`. Each entry carries `{ name, category, title, description, schema, defaultProps?, examples? }`. Transitions live inside the same array with `category: 'transitions'` — consumers who want only components filter by category; consumers who want everything (system prompts, training data) iterate the array as-is.

The `ondajs` npm package, which today ships only the CLI binary, gains a library surface alongside. Two entry points are exposed via the package's `exports` map: `ondajs` (default — surfaces the manifest) and `ondajs/manifest` (subpath alias — discoverable for consumers who reach for `from 'ondajs/manifest'` per the issue). Both resolve to the same module.

A new build script walks `registry/components/*/schema.ts` and `registry/transitions/*/<slug>.ts`, imports each schema, joins it with the metadata from the corresponding `<slug>.meta.json` (and `registry/registry.json` for cross-checks), and emits a single typed `manifest.ts` module into the CLI package's source tree. The CLI's existing `tsup` (or equivalent) build then compiles it to `dist/manifest.js` + `dist/manifest.d.ts`. The generation step runs in `prepublishOnly` so a stale manifest can never reach npm.

Shape — verbatim from the issue, kept flat for LLM ergonomics:

```ts
export type ComponentManifestEntry = {
  /** Slug — matches the registry folder name. Used as the dispatch key. */
  name: string;
  /** Category from the component's meta.json: 'entrances' | 'scenes' | 'data' | 'graphics' | 'cinematic' | 'atmosphere' | 'transitions' | … */
  category: string;
  /** PascalCase display name. */
  title: string;
  /** One-paragraph description (same string the registry.json catalog shows). */
  description: string;
  /** The component's Zod schema. Consumers can `.parse()`, `.extend()`, or feed it into a discriminated union. */
  schema: z.ZodTypeAny;
  /** Materialized defaults — what `schema.parse({})` returns. Pre-computed so consumers
   *  don't have to round-trip Zod just to read defaults (e.g. when rendering a JSON UI). */
  defaultProps?: Record<string, unknown>;
  /** Reserved for future. Today: omitted. */
  examples?: ReadonlyArray<{ name: string; description?: string; props: Record<string, unknown> }>;
};

export const manifest: ReadonlyArray<ComponentManifestEntry>;
```

## Goals

- One import unlocks the catalog: `import { manifest } from 'ondajs'` is the only API surface a consumer needs to learn.
- Flat-array shape matches the LLM-canonical `manifest.map(...)` / `manifest.find(...)` patterns — no nested objects to traverse.
- Adding a new component (or transition) to the registry includes it in the next published manifest automatically — zero contributor steps beyond the existing `sync-registry` flow.
- Manifest version is locked to the `ondajs` package version (no separate package, no drift between CLI and manifest).
- Existing CLI surface (`npx ondajs add <slug>`) and the source-you-own distribution model stay 100% unchanged.
- Schemas are real Zod objects, not stringified JSON Schema — consumers can extend, discriminate, and re-parse.

## Non-goals

- Not shipping component source through the manifest. Onda's source-you-own model stays — the manifest carries metadata + schemas only, never the React components.
- Not a dynamic remote registry. The manifest is static, generated at build time, frozen into the published package version.
- Not bundling structured `examples` in v1. The field is reserved in the type but generation is deferred — no `examples.ts` files exist today, and parsing READMEs is brittle. Ship the field shape, populate it in a future spec.
- Not changing the existing `npx ondajs add <slug>` flow or the registry.json shape.

## Reasonable calls (challenge any)

- **Flat array over `{ components, transitions }` object.** Components and transitions are both "things you can use in onda" — splitting them forces the consumer to learn two sub-arrays. The `category` field on each entry is already the discriminator. The issue's own example consumer code (`manifest.map(...)`) only works on a flat array.

- **Bundle the schemas into the npm package.** The alternative is shipping schemas as JSON Schema strings and reconstructing Zod on the consumer side — much lossier (Zod features like `.refine()`, custom errors, branded types don't survive the round-trip). The schema files are tiny (~30 schemas × ~2KB each = ~60KB of typed code) and the consumer almost always wants Zod anyway. Cost is acceptable.

- **Pre-compute `defaultProps`.** The issue lists it as optional. Most consumers building agent prompts or JSON UIs want to read defaults without invoking Zod. We can compute these at build time via `schema.parse({})` and inline them as plain JSON, saving every consumer the round-trip.

- **`ondajs` default export AND `ondajs/manifest` subpath.** The issue allows either. Both work (alias the same module). Belt-and-suspenders for discoverability — agents that guess subpaths and agents that guess root imports both succeed.

- **Skip examples in v1.** No `examples.ts` files exist today, READMEs would need parsing, and the issue marks the field as optional. Ship the type, defer the data. Tracked as a follow-up: techspec 019+ adds `examples.ts` per component with curated prop archetypes.

- **Run generation in `prepublishOnly`.** Manifest generation is fast (~100ms) — running it pre-publish guarantees the published manifest matches the published source. Running it in `predev` too would let local typecheck catch consumer-shape mistakes early, but isn't strictly required.

## Open questions — resolved during implementation

- **Schema referencing**: imported, not inlined. esbuild bundles the schema modules into a single `dist/manifest.js`. `placementSchema` and `sizeRoleSchema` from `lib/canvas` flow through transparently.

- **`category` source of truth**: meta.json wins. The generator reads each `<slug>.meta.json`'s `category` string directly. `registry.json`'s `categories[]` array is not used.

- **Transition entries vs component entries**: same entry shape. `category: 'transitions'` is the discriminator. Consumers filter by category when they need only one or the other.

- **Version field**: skipped in v1. Consumers wanting a version key can read it from `package.json`. Easy to add later if a real need surfaces.

## Implementation — schema-source-split refactor

Done as part of this spec, not deferred. Original concern: the schemas lived inside their components' `<Component>.tsx` files (with `schema.ts` as a re-export per the existing convention). When esbuild bundled the manifest, it followed the re-export chain into the component files and couldn't drop their top-level `import React from 'react'` and Remotion imports — the manifest bundle dragged React + Remotion through even though it only ever invoked Zod.

The fix moved schema definitions into pure `schema.ts` files (no React, no JSX) and split `lib/canvas.tsx` into a sibling `lib/canvas-schemas.ts`. Every component / transition `schema.ts` is now the canonical home of its Zod schema; the `.tsx` files import the schema from `./schema` and re-export it for back-compat — every existing consumer importing `{ blurRevealSchema }` from either path keeps working.

Done mechanically via a one-time AST-based codemod (`scripts/refactor-schemas-ast.mjs`) that:

1. Parses each `<Component>.tsx` with the TypeScript compiler API
2. Locates the schema `VariableStatement` (init is a `CallExpression` on `z.*`) plus its inferred `Props` / `Options` type alias
3. Pulls in any local helper consts the schema depends on (e.g. audio-clip's `const timeSpec = z.union(...)`)
4. Re-routes `lib/canvas` imports needed by the schema to `lib/canvas-schemas`
5. Emits a self-contained `schema.ts` and rewrites the implementation file with trimmed imports + a back-compat re-export

Result:

- Manifest bundle: **41 KB minified** (was 48 KB pre-refactor) — 15% smaller.
- Zero React, Remotion, or `@remotion/*` imports in `dist/manifest.js` — only `zod`.
- Only one peer dependency now: `zod`. React + Remotion + `@remotion/*` are no longer declared as peers at all. Non-React consumers (training-data pipelines, validators, brief generators) can use the manifest with `zod` as their sole runtime dependency.
- CLI binary unchanged; `npx ondajs add <slug>` flow identical to before.
