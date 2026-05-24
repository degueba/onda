# Roadmap — Techspec 013

Execution plan for [design.md](design.md). Single PR.

## M1 — `lib/composition-json-schema.ts`

**Acceptance:**

- New file at `lib/composition-json-schema.ts`.
- Adds `zod-to-json-schema` to root `package.json` (devDep) — runtime consumers get it as a peer dep declared in the CLI manifest.
- Exports `compositionJsonSchema` and `entrySchema` via `zodToJsonSchema(compositionSchema, 'Composition')` and `(entrySchema, 'Entry')`.
- Re-exported via `lib/index.ts` barrel.
- New `registry/r/lib-composition-json-schema.json` manifest:
  - `type: 'registry:lib'`
  - `dependencies: ['zod', 'zod-to-json-schema']`
  - `registryDependencies: ['lib-composition']`
  - `files: [{ path: 'lib/composition-json-schema.ts', type: 'registry:lib', target: 'lib/onda/composition-json-schema.ts' }]`
- `pnpm typecheck` passes.
- Dry-run install verifies: `ondajs add lib-composition-json-schema` pulls `lib-composition` transitively + prints `zod-to-json-schema` in the peer-dep install line.

## M2 — `lib/canvas-presets.ts`

**Acceptance:**

- New file with the 5 presets from design.md and the `CanvasPreset` type.
- Exports `CANVAS_PRESETS` (named-key map), `CanvasPreset` (key union type), and `resolveCanvas(spec)` that accepts either form and returns `{width, height, fps}` with defaulted fps (30) for object form when omitted.
- Re-exported via `lib/index.ts`.
- New `registry/r/lib-canvas-presets.json` manifest:
  - `type: 'registry:lib'`
  - `dependencies: []` (pure data + one function, no runtime deps)
  - `registryDependencies: []`
- `pnpm typecheck` passes.

## M3 — `lib/registry-summary.ts`

**Acceptance:**

- New file exporting `summarizeRegistry(registry: ComponentRegistry): RegistrySummary` and `summarizeRegistryAsMarkdown(registry): string`.
- `summarizeRegistry` walks each entry's Zod schema:
  - Detects `placement` / `size` keys → `supportsPlacement` / `supportsSize` booleans.
  - For each top-level prop in the schema, extracts: name, Zod-inferred type string, required flag, default value (if any), `.describe()` text (if any).
- `summarizeRegistryAsMarkdown` formats the structured output as a clean markdown reference suitable for pasting into a system prompt. Tested against a small registry of 3 components (e.g., `BlurReveal`, `TitleCard`, `Callout`).
- `RegistrySummary` type exported.
- Re-exported via `lib/index.ts`.
- New `registry/r/lib-registry-summary.json` manifest:
  - `type: 'registry:lib'`
  - `dependencies: ['zod']`
  - `registryDependencies: ['lib-composition-renderer']` (for the `ComponentRegistry` type)
- `pnpm typecheck` passes.

## M4 — Update `docs/composing-with-onda.md`

Append a short "Agent contract helpers" section under the existing payload / placement / size sections. Documents:

- `compositionJsonSchema` + `entryJsonSchema` — how to drop into LLM structured output (one example for OpenAI, one for Anthropic).
- `CANVAS_PRESETS` + `resolveCanvas` — what the named presets mean, how to pick.
- `summarizeRegistry` + `summarizeRegistryAsMarkdown` — how to feed registry into a system prompt.

Plus a single example showing all three composed: agent runtime that consumes the JSON schema, picks a canvas preset, and builds its system prompt from the registry summary.

## M5 — Verify end-to-end with dry-run installs

**Acceptance:**

- `bunx ondajs add lib-composition-json-schema --registry file://...` → pulls lib-composition transitively, prints `zod-to-json-schema` peer dep.
- `bunx ondajs add lib-canvas-presets --registry file://...` → standalone install, no deps.
- `bunx ondajs add lib-registry-summary --registry file://...` → pulls lib-composition-renderer transitively (which pulls lib-composition + lib-timing).
- All three install paths resolve cleanly with no errors.

## M6 — Commit, push, PR

**Acceptance:**

- One coherent PR titled `feat(lib): agent contract helpers — JSON schema, canvas presets, registry summary (013)`.
- Body groups commits by helper and links to design.md.
- CI green before merge.

## Out of scope (later techspecs)

- **Demo Composition payloads** (Studio's ask #4) — their own techspec, needs distribution decision.
- **`<CompositionRenderer partial />`** — streaming renderer; defer until Studio's real agent ships.
- **Per-component `examples.json`** (playgroundPresets) — distinct concern from whole-composition demos.
- **`className` per-component** — low-priority polish item.
- **`style` prop on components** — explicitly rejected.
- **011 audio primitives execution** — next techspec after this one.
