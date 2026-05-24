# Techspec 007 — Component theming API

> **Status: Paused** — superseded as the immediate next move by [008-canvas-aware-components](../008-canvas-aware-components/design.md). The work here is not killed; resume when palette-swap and class-attachment friction become real signal.

## Problem

Users embedding Onda components into a programmatic compositor (a JSON-driven brief renderer, an agent-generated scene, a per-section design override) hit a friction wall that's invisible to a normal copy-paste user. Concrete case from a real user:

> *"To make a single TitleCard amber I need to set `color`, `subtitleColor`, and `accentColor`. For a 5-component scene that's 15+ props per palette swap. Can we just add `style` and `className` to everything?"*

Their proposed fix — a `style: CSSProperties` passthrough on every component — would erode our central contract: **the Zod schema IS the component's API** (and our future training-data schema). A `style` bag lets callers override `opacity` / `transform` / `filter` inline, silently breaking the motion identity. We'd be trading the moat for short-term convenience.

But the underlying complaint is real. Audit of 10 representative components (`TitleCard`, `StatCard`, `BarChart`, `Callout`, `Spotlight`, `QuoteCard`, `CountUp`, `BlurReveal`, `WordStagger`, `Highlight`, `LowerThird`) shows:

- **Per-slot color and typography is fully exposed.** Every component takes `color` / `accentColor` / `fontFamily` / `fontSize` as typed props. The atomic surface is rich. Brief-driven use is *technically* possible.
- **No aggregate.** There is no single prop that says "apply this palette." Each color slot must be set individually, multiplied across every component in a scene.
- **No `className`.** Devs can't attach their app's layout / positioning classes to the outer container without forking the component file.
- **Display typography is under-exposed.** CLAUDE.md §2 specifies `fontWeight: 600`, tight letter-spacing (-0.02 to -0.04em), but those values are baked into the `.tsx` — not props. Serious users hit a ceiling on tracking and weight without forking.
- **`Callout` and `Spotlight` take `canvasWidth` / `canvasHeight` as props** while already calling `useVideoConfig()` for `fps`. The composition's dimensions should come from the same hook. This is a wart that forces brief renderers to plumb dimensions manually.
- **Inconsistent slot naming.** `color` everywhere means "primary text," but it's not documented as a contract — readers infer it from each schema.

`lib/tokens.ts` already exports `COLOR`, `FONT`, `ColorToken`, `FontToken` — the building blocks for an aggregate exist. We just don't expose them as a unit.

## Decision

**Hold the line on no `style` passthrough.** Instead, close the four typed gaps the audit surfaced. The result: brief-driven runtimes get a one-prop palette swap, devs get a `className` hook, display typography exposes the dimensions CLAUDE.md §2 already specifies, and `Callout` / `Spotlight` stop demanding dimensions the runtime already knows.

**1. Add a `theme?: Theme` prop to every component.**

```ts
// lib/theme.ts (new)
import type { COLOR, FONT } from './tokens';

export type Theme = {
  // Color slots — all optional, all default to the matching COLOR token.
  bg?: string;
  surface?: string;
  surface2?: string;
  border?: string;
  borderLit?: string;
  text?: string;
  dim?: string;
  faint?: string;
  accent?: string;
  accentSoft?: string;
  // Typography slots.
  fontDisplay?: string;
  fontBody?: string;
};
```

Slot names mirror `lib/tokens.ts` exactly — one vocabulary across tokens / theme / props. Per-slot props still exist and **win over `theme`**, so brief renderers can pass a theme aggregate and selectively override one slot per component. Precedence: **per-slot prop > `theme` slot > `COLOR` / `FONT` default**.

Each component resolves its slots via a small helper:

```ts
// lib/theme.ts
export function resolveTheme(theme: Theme | undefined): Required<Theme> {
  return { ...DEFAULT_THEME, ...theme };
}
```

The component reads `const t = resolveTheme(theme)`, then uses `color ?? t.text` / `accentColor ?? t.accent` / etc. for its defaults. No behavior change when `theme` is omitted.

**2. Add a `className?: string` prop on the outer container of every component.**

One-line addition per component: `<div className={className} ...>`. No `style` prop, no merge — the user's class composes with the component's inline styles (motion-driven inline styles win the cascade, layout/sizing classes from the user attach cleanly). Standard React pattern.

**3. Expose typography dimensions specified in CLAUDE.md §2.**

Add to display-text components (`TitleCard`, `BlurReveal`, `QuoteCard`, `StatCard`, `CountUp`, `WordStagger`, `LowerThird`, `Highlight`, `Callout`):

- `fontWeight?: number` — default `600`.
- `letterSpacing?: string` — default `'-0.02em'` for headlines, `'0'` for body.
- `lineHeight?: number` — default `1` for headlines, `1.4` for body / multi-line.

These were always part of the brand spec; they just weren't reachable. Adding them lets serious users tune tracking without forking.

**4. Auto-read canvas dimensions in `Callout` and `Spotlight`.**

Remove `canvasWidth` and `canvasHeight` from both schemas. Read `width` / `height` from `useVideoConfig()` alongside the existing `fps` read. This is a small breaking change to the two components' prop surfaces; both are recent and unlikely to be widely embedded.

**5. Document the contract.**

Add `docs/theming.md` covering: the three-tier precedence model (per-slot > theme > default), the `Theme` shape, why there's no `style` prop, and the "your `className` for layout, our props for motion-bound visuals" rule. Link from `README.md` and `CLAUDE.md §2`. Surface as a top-level page on the docs site under the same nav level as Components.

## Goals

1. A brief-driven renderer can swap a scene's palette with **one `theme={...}` prop per component**, not 15 individual color props.
2. Devs can attach layout / positioning classes via `className` without forking components.
3. CLAUDE.md §2's typography spec (`fontWeight 600`, tight tracking) is reachable as props on every display component.
4. `Callout` and `Spotlight` read canvas dimensions from `useVideoConfig()`, matching Remotion idiom.
5. No `style` passthrough; the Zod schema remains the component's full API.
6. Existing component callers see zero behavior change when they don't pass the new props (additive, defaults preserved).

## Non-goals

- A `style?: CSSProperties` prop on any component. Explicitly rejected — see Problem.
- Renaming existing color slots (e.g., `color` → `textColor`). Audit shows current names are consistent; renaming breaks every copied component in the wild.
- A runtime `<ThemeProvider>` React context. Components stay self-contained per CLAUDE.md §4.4 — `theme` is a prop, not ambient state. Brief renderers can pass the same object to every child themselves; the cost is one prop per call, not architectural complexity.
- Per-component `align` / `justify` props (raised in the audit but lower-priority). Add when a specific component needs it; not a blanket retrofit.
- Audio primitives, `from`/`durationInFrames` props as alternatives to `delay`/`duration` (the parent `<Sequence>` model already covers this — see CLAUDE.md §3 "Compose timing with `<Sequence>`").

## Reasonable calls (challenge any)

- **Theme is a prop, not a context.** Self-contained components are a §4.4 rule, and React context complicates SSR, training-data extraction, and copy-paste portability. The "every component takes the same object" verbosity is a feature in a brief-driven runtime — explicit data flow beats hidden state.
- **Per-slot props still win.** A `theme` aggregate plus a slot override is the common case: "amber palette, but this one TitleCard keeps the rose accent." Inverting precedence (theme wins) would force users to construct one-off themes for one-off tweaks.
- **No `style`, even narrowed.** Even a `containerStyle` prop tempts overrides of `opacity` / `transform` and breaks the motion contract. `className` is enough — CSS classes can't accidentally fight inline styles unless `!important` is used, which is the user's choice and clearly off-spec.
- **`Callout` / `Spotlight` lose their canvas props (small breaking change).** Both are recent, the change moves them onto the standard Remotion idiom, and the alternative — keeping them as optional overrides — invites silent dimension drift when callers forget to update them.
- **`fontWeight` / `letterSpacing` / `lineHeight` are typed at the component level, not on `theme`.** Typography slots vary too much per-component (the title vs. its subtitle want different weights) for a single theme-wide value. Theme stays color + family; per-element dimensions stay per-prop.
- **Display-component refactor is mechanical and parallelizable.** One agent per component folder, identical pattern (`resolveTheme` import + slot fallbacks + `className` passthrough). No shared-file edits, no motion changes.

## Open questions deferred

- **Should `lib/theme.ts` export named theme presets (`THEME_GRAPHITE`, `THEME_AMBER`)?** Tempting for the docs page, but it commits us to maintaining a palette catalog. Defer — let users build their own; revisit if a clear set of "official" alternative palettes emerges.
- **Should `className` be `containerClassName` for clarity?** `className` matches React idiom and is what callers will reach for first. Keep it, document the scope ("attaches to the outer container only").
- **A `data-onda-component="<name>"` attribute on every outer container?** Useful for runtime introspection by brief renderers / debugging tools. Cheap, but no concrete demand yet. Defer.
- **A unified `align?: 'start' | 'center' | 'end'` prop across typography components?** Surfaced in the audit; only `WordStagger` exposes `justify` today. Defer until one more component needs it.
