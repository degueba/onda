# Roadmap — Techspec 007

> **Status: Paused** — superseded as the immediate next move by [008-canvas-aware-components](../008-canvas-aware-components/roadmap.md). The work here is not killed; resume when palette-swap and class-attachment friction become real signal.

Execution plan for [design.md](design.md). Update statuses as work lands.

## M1 — Add `lib/theme.ts` with `Theme` type and `resolveTheme`

New file alongside `lib/tokens.ts`. Reuses `COLOR` and `FONT` directly — no new constants.

**Acceptance:**

- `lib/theme.ts` exports `Theme` (all-optional shape mirroring `COLOR` slots + `fontDisplay` / `fontBody`).
- Exports `DEFAULT_THEME: Required<Theme>` built from `COLOR` and `FONT`.
- Exports `resolveTheme(theme: Theme | undefined): Required<Theme>` — pure, deterministic, returns `DEFAULT_THEME` when called with `undefined`.
- File-level doc comment cross-links `lib/tokens.ts` as the canonical token source, and `docs/theming.md` (M5) as the user-facing contract.
- `pnpm typecheck` passes.

## M2 — Fix `Callout` and `Spotlight` to auto-read canvas dimensions

Two components, one focused change each. Remove `canvasWidth` / `canvasHeight` from both schemas; destructure `width` / `height` from `useVideoConfig()` alongside `fps`.

**Acceptance:**

- `calloutSchema` and `spotlightSchema` no longer declare `canvasWidth` / `canvasHeight`.
- Both components destructure `{ fps, width, height }` from `useVideoConfig()` and use `width` / `height` wherever the old props were referenced.
- Both READMEs updated: prop tables drop the two canvas props; usage snippets no longer pass them.
- Visual output for default props is pixel-identical to before (1920×1080 was the default in both, matching the standard composition).
- `r/callout.json` and `r/spotlight.json` regenerated from the updated source.
- `pnpm typecheck` passes; `pnpm --filter www build` produces both component pages cleanly.

## M3 — Retrofit `theme` + `className` across all 40 components (parallel agents)

One agent per component folder. Identical mechanical pattern, no shared-file edits, no motion changes.

**Per-component recipe:**

1. Add `theme: z.custom<Theme>().optional()` to the schema (or equivalent — final encoding decided in M1).
2. Add `className: z.string().optional()` to the schema.
3. In the component body: `const t = resolveTheme(theme);`.
4. Replace every hardcoded token-value default fallback (`color ?? '#F2F2F4'`) with `color ?? t.text` (and the matching slot for each).
5. Attach `className={className}` to the outermost element (typically the `<div>` or `<AbsoluteFill>` already there).
6. Update the README's prop table to include both new props.

**Acceptance:**

- All 40 components in `registry/components/` accept `theme` and `className`.
- Default rendering (no `theme`, no `className`) is pixel-identical to pre-change.
- Passing `theme={{ accent: '#E1A04A' }}` recolors only the accent-bound slots; everything else uses defaults.
- Per-slot props still win over `theme` slots (verified by passing both and observing the per-slot value).
- All 40 `r/<slug>.json` registry manifests regenerated.
- `pnpm typecheck` and `pnpm --filter www build` both pass.

## M4 — Add typography dimension props to display components

Adds `fontWeight`, `letterSpacing`, `lineHeight` (with CLAUDE.md §2 defaults) to display-text components: `TitleCard`, `BlurReveal`, `QuoteCard`, `StatCard`, `CountUp`, `WordStagger`, `LowerThird`, `Highlight`, `Callout`.

Parallelizable — one agent per component folder.

**Per-component recipe:**

1. Add `fontWeight: z.number().default(600)`, `letterSpacing: z.string().default('-0.02em')`, `lineHeight: z.number().default(1)` to the schema (defaults per component — body / multi-line components use `lineHeight: 1.4`, `letterSpacing: '0'`).
2. Pass each through to the corresponding inline style on the text element.
3. Update README prop tables.

**Acceptance:**

- Each listed component exposes the three dimensions as optional props.
- Defaults reproduce current rendering exactly.
- Registry manifests regenerated for the changed components.
- `pnpm typecheck` and `pnpm --filter www build` pass.

## M5 — Author `docs/theming.md` and surface on the docs site

The user-facing contract page. Required content:

- The three-tier precedence model: per-slot prop > `theme` slot > token default.
- The `Theme` shape with each slot's role (cross-linked from `lib/tokens.ts`).
- A worked example: a scene that swaps to an amber palette via one `theme` object reused across components, with one component selectively overriding a slot.
- The `className` rule: "your classes for layout / positioning, our props for motion-bound visuals."
- The "why no `style` prop" section: short, principled, links to the motion language doc.

**Acceptance:**

- `docs/theming.md` exists, written for an external dev audience (not internal techspec voice).
- Linked from `README.md` (top-level doc list) and `CLAUDE.md §2`.
- Rendered on the docs site as a top-level nav entry at the same level as Components.
- `pnpm --filter www build` produces the page cleanly.

## M6 — Verify parent-`<Sequence>` timing across the catalog

Independent of the theming work but raised in the same audit. Audit every component to confirm none wraps itself in a `<Sequence from={...}>` that would override parent-supplied timing. This is the bug class brief renderers care about most ("my parent `<Sequence from={X}>` didn't shift the animation").

**Acceptance:**

- Audit doc (or inline notes in this roadmap) lists every component checked. Pass / fail per component.
- Any component found wrapping its motion in an internal `<Sequence from={...}>` is refactored to use `useCurrentFrame()` directly, so parent `<Sequence>` remapping takes effect.
- A smoke test: pick 3 components, wrap each in `<Sequence from={fps * 2}>` in a test composition, confirm motion starts at the 2-second mark.

## Out of scope (later techspecs)

- Named theme presets in `lib/theme.ts` (`THEME_AMBER`, `THEME_GRAPHITE`, etc.).
- A `<ThemeProvider>` React context for ambient theming.
- A `style?: CSSProperties` prop on any component (explicitly rejected — see [design.md](design.md)).
- Renaming `color` → `textColor` or any cross-component slot normalization beyond what M3 already touches.
- Per-component `align` / `justify` retrofit beyond `WordStagger`.
- Audio primitives, `from`/`durationInFrames` props.
- New components — this techspec touches the existing 40 only.
