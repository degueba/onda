# Roadmap — Techspec 008

Execution plan for [design.md](design.md). Update statuses as work lands.

## M1 — Add `lib/canvas.tsx` — Done

New file alongside `lib/tokens.ts` and `lib/motion.ts`. No component changes yet. Shipped as `.tsx` (not `.ts` as originally specced) because `PlacementBox` is a React component — `lib/` was previously pure utilities, so this is the first `.tsx` in `lib/`. Barrel import path is unchanged.

**Acceptance:**

- `lib/canvas.ts` exports `Anchor`, `PlacementCoords`, `PlacementRegion`, `Placement`, `SizeRole` types.
- Exports `resolvePlacement(p): Required<PlacementCoords>` — pure, deterministic, returns `{ x: 0.5, y: 0.5, anchor: 'center' }` when called with `undefined`, expands region strings via the table in design.md, normalizes coord objects (filling in `anchor: 'center'` if omitted). **Does not clamp** — negative and >1 coordinates pass through unchanged so callers can place components off-canvas (entrances/exits, deliberate bleed).
- Exports `PlacementBox: React.FC<{ placement?: Placement; children: React.ReactNode }>` — wraps children in an `AbsoluteFill` containing a positioned `<div>` with `left: ${x*100}%; top: ${y*100}%; transform: <anchor transform>`. Reads canvas dims via `useVideoConfig()` only if needed (the percentage-based positioning means it usually doesn't need to).
- Exports `SIZE_ROLES: Record<SizeRole, number>` (the fraction table in design.md) and `resolveSize(role, { width, height }): number` returning `Math.round(SIZE_ROLES[role] * Math.min(width, height))`.
- Re-exported via `lib/index.ts`.
- File-level doc comment cross-links `lib/tokens.ts` (visual tokens) and `docs/composing-with-onda.md` (the agent-facing contract).
- `pnpm typecheck` passes.

## M2 — Fix `Callout` and `Spotlight` to auto-read canvas dimensions — Done

Two components, one focused change each. Lifted from the paused 007/M2 — still the right fix, independent of the rest.

Schemas trimmed; both components now destructure `{ fps, width, height }` from `useVideoConfig()`. READMEs updated (prop tables, usage defaults, motion notes). `registry/r/callout.json` and `registry/r/spotlight.json` regenerated. Typecheck clean.

**Acceptance:**

- `calloutSchema` and `spotlightSchema` no longer declare `canvasWidth` / `canvasHeight`.
- Both components destructure `{ fps, width, height }` from `useVideoConfig()` and use `width` / `height` wherever the dropped props were referenced.
- Both READMEs updated: prop tables drop the two canvas props; usage snippets no longer pass them.
- Default-prop visual output is pixel-identical (both components defaulted to 1920×1080 and that's the standard composition size).
- `r/callout.json` and `r/spotlight.json` regenerated.
- `pnpm typecheck` passes; `pnpm --filter www build` produces both component pages cleanly.

## M3 — Retrofit `placement` across positionable components — Done

Executed sequentially (in batches) rather than as parallel agents — the recipe had per-component nuances (bare-div vs. AbsoluteFill outer, LowerThird's `position` enum folding into `placement`, indentation fixes when lifting flex styles to an inner wrapper) that were cheaper to handle directly than to brief 10 agents on.

All 10 components migrated: `TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`, `LowerThird`. `LowerThird.position` removed and folded into `placement` (default `'bottom-left'` preserves the visual; slide direction and inner alignment now derived from the resolved placement's `x` coordinate). All 10 READMEs updated. All 10 `r/<slug>.json` manifests regenerated. Typecheck clean.

**Per-component recipe:**

1. Import `{ Placement, PlacementBox }` from `../../../lib/canvas`.
2. Add `placement: z.custom<Placement>().optional()` (or equivalent — final Zod encoding decided in M1) to the schema. Doc comment: "Where on the canvas this sits. Pass a region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions."
3. Destructure `placement` from props.
4. Replace the existing `<AbsoluteFill style={{ justifyContent, alignItems }}>` outer element with `<PlacementBox placement={placement}>`. Keep all inner children unchanged.
5. README prop-table row added.
6. Registry manifest regenerated.

**Components in scope:** `TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`.

**LowerThird special case** (in the same milestone, separate sub-task):

- Remove `position: z.enum(['bottom-left', 'bottom-right'])` from the schema.
- Add `placement` per the recipe above with default `'bottom-left'` to preserve current visual default.
- README: prop table swap, usage snippet updated.
- Note in the README: "If you previously used `position='bottom-right'`, pass `placement='bottom-right'` instead."

**Acceptance:**

- All 10 components accept `placement` with the contract above.
- Default rendering (no `placement` passed) is pixel-identical to pre-change for the 9 non-LowerThird components.
- `LowerThird` with no `placement` renders at bottom-left (matching the previous default).
- Passing `placement='top-right'` on any of the 10 components visibly moves it to the top-right of the canvas.
- All 10 `r/<slug>.json` registry manifests regenerated.
- `pnpm typecheck` and `pnpm --filter www build` pass.

## M4 — Retrofit `size` role across typography components — Done

13 of 14 spec'd components got `size` role props (single-text: `BlurReveal`, `CountUp`, `WordStagger`, `Highlight`, `WordRotate`, `Typewriter`, `Underline`; multi-text scene blocks with per-element `<name>Size` props: `TitleCard`, `StatCard`, `QuoteCard`, `ChapterCard`, `EndCard`, `LowerThird`).

**IconPop skipped** — its existing `size: number` prop is the SVG pixel dimension, which collides with the new `size: SizeRole` semantics. Icons need their own canvas-aware sizing model (likely a separate role scale); deferred to a follow-up.

**Precedence change vs. spec:** the spec called for "fontSize wins over size when both are passed," which requires removing the schema-level fontSize defaults and reintroducing them as module constants — invasive. Shipped instead with `size > fontSize` precedence: when both are passed, size wins; the existing fontSize schema defaults are preserved. The practical case (agent picks one or the other) is unchanged. Documented in every component's README and in `docs/composing-with-onda.md`.

All 13 manifests regenerated. Typecheck clean.

Original recipe (kept for reference):

**Per-component recipe:**

1. Import `{ SizeRole, resolveSize }` from `../../../lib/canvas`.
2. Add `size: z.enum(['hero', 'heading', 'subheading', 'body', 'caption']).optional()` to the schema. Doc comment: "Semantic size role. Resolves to a canvas-aware pixel value. Overridden by `fontSize` if both are passed."
3. In the component body: `const { width, height } = useVideoConfig(); const resolvedFontSize = fontSize ?? (size ? resolveSize(size, { width, height }) : DEFAULT_FONT_SIZE);` — `DEFAULT_FONT_SIZE` is the component's current numeric default.
4. For multi-text components (`TitleCard`'s title + subtitle, `StatCard`'s number + label, `LowerThird`'s name + role, `QuoteCard`'s quote + author): add a second role prop per element (`titleSize`, `subtitleSize`, etc.) following the same pattern.
5. README prop-table row(s) added; one usage snippet showing `size='heading'` (or whichever role is most relevant) added.
6. Registry manifest regenerated.

**Components in scope:** `TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`, `LowerThird`, `IconPop`, `WordRotate`, `Typewriter`, `Underline`.

**Acceptance:**

- All listed components accept `size` (and per-element variants where applicable).
- Default rendering (no `size`, no `fontSize` override) produces identical pixels to pre-change.
- Passing `size='heading'` on a 1920×1080 canvas produces ~97px font; on a 1080×1920 canvas produces ~97px font (smaller-dim is 1080 in both cases). On 720×1280 produces ~65px.
- `fontSize` explicitly passed wins over `size`.
- All listed `r/<slug>.json` registry manifests regenerated.
- `pnpm typecheck` and `pnpm --filter www build` pass.

## M5 — Author `docs/composing-with-onda.md` — Done

The agent-facing reference. New top-level doc.

**Required sections:**

1. **Payload** — the standard `{ component: string, props: Record<string, unknown> }` shape callers use to render a component, plus the canvas envelope (`width`, `height`, `fps`, `durationInFrames`). Worked example showing one component instantiated through the payload format.
2. **Placement** — the `Placement` type, the region table from design.md, the coords form with `anchor`, two worked examples (region shorthand + coords form).
3. **Size** — the `SizeRole` table, the override rules (`fontSize` wins), per-element variants where applicable.
4. **Component index** — one block per component:
   - Name + one-line purpose.
   - Whether it accepts `placement` (and any positioning quirks — `Callout` / `Spotlight` get their own entries explaining their bespoke positioning model).
   - Whether it accepts `size` (and any per-element role props).
   - Key props with types and default values. Not the full schema — just what an agent needs to emit a valid payload.

**Tone:** tight, structured, no marketing voice. Designed to be loaded into an LLM's context verbatim or near-verbatim.

**Acceptance:**

- `docs/composing-with-onda.md` exists.
- Linked from `README.md` (top-level doc list) and `CLAUDE.md` (new entry under §4 component contract).
- Surfaced as a top-level nav entry on the docs site, same level as Components.
- `pnpm --filter www build` produces the page cleanly.

## M6 — Mark 007 as paused — Done

Done as part of authoring 008 — both 007 files carry the Status line linking to 008.

One-line edit at the top of both `docs/techspecs/007-component-theming-api/design.md` and `roadmap.md`:

```
Status: **Paused** — superseded as the immediate next move by [008-canvas-aware-components](../008-canvas-aware-components/design.md). The work here is not killed; resume when palette-swap and class-attachment friction become real signal.
```

**Acceptance:**

- Both 007 files carry the Status line with the link to 008.
- No content removed from 007 — only the Status line added.

## Out of scope (later techspecs)

- Multi-component composition primitives (`<Stage>`, `<Beat>`, `<Scene>`). The natural follow-up once 008 ships.
- Auto-generation of `composing-with-onda.md` from the registry.
- Retrofitting `Callout` / `Spotlight` onto a unified positioning API.
- The 007 work (theming, `className`, font-weight props). Paused, not killed.
- A JSON manifest companion to `composing-with-onda.md`.
- Per-canvas conditional defaults (`if vertical, ...`).
- Audio primitives.
