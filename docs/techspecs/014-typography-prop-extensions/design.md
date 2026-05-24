# Techspec 014 — Typography prop extensions

## Problem

CLAUDE.md §2 specifies the brand's display typography:

> Headlines: tight letter-spacing (-0.02 to -0.04em), weight 600.
> Labels / code / captions: uppercase for eyebrows, letter-spacing ~0.06–0.16em.

…but those values are baked into the `.tsx` of every text primitive (`fontWeight: 600` hardcoded in `BlurReveal`, `FadeIn`, `WordStagger`, etc.; `letterSpacing` and `lineHeight` largely unset, so they fall back to browser defaults). A user composing primitives directly cannot:

- Set a 500-weight title without forking the primitive.
- Tune tracking to `-0.04em` for hero copy (CLAUDE.md explicitly says this is in-spec).
- Tighten `lineHeight` for multi-line marquee text.
- Right-align a `FadeIn` caption above a right-anchored placement.

The `fontFamily` / `color` / `fontSize` props already exist on every primitive. The remaining dimensions of typography — weight, tracking, leading, alignment — should sit at the same level. This is the "typed-prop" half of the paused [007 theming spec](../007-component-theming-api/design.md), pulled forward without the `theme` aggregate or `className` debate.

## Decision

Extend every text-rendering primitive with four optional props:

```ts
fontWeight?: number;       // default: current hardcoded value (600 for display, 500 for body)
letterSpacing?: string;    // default: 'normal' (or the existing hardcoded value where one exists)
lineHeight?: number;       // default: 1.1 (display) / 1.4 (body) where unset; preserve existing where set
align?: 'left' | 'center' | 'right'; // default: 'left' — text-align on the rendered block
```

Plumb each through to the existing inline `style` object. No behavior change when callers omit them: defaults match what each primitive renders today.

### In scope (14 primitives)

| Component | Current `fontWeight` | Current `letterSpacing` | Current `lineHeight` |
| --- | --- | --- | --- |
| `BlurReveal` | 600 | — | — |
| `FadeIn` | 600 | — | — |
| `FadeOut` | 600 | — | — |
| `SlideIn` | 600 | — | — |
| `SlideOut` | 600 | — | — |
| `MaskReveal` | 600 | — | — |
| `RotateIn` | 600 | — | — |
| `ScaleIn` | 600 | — | — |
| `Typewriter` | 500 | — | — |
| `WordStagger` | 600 | — | — |
| `WordRotate` | 600 | `-0.02em` | — |
| `CountUp` | 600 | — | — |
| `Highlight` | 600 | — | — |
| `Underline` | 600 | — | — |

`Captions` already exposes `fontWeight` and hardcodes `lineHeight: 1.15`. Bring it into the same contract: keep `fontWeight`, add `letterSpacing` + `lineHeight` (default `1.15`) + `align` (default `'center'`).

### Out of scope

- **Scene composers** (`TitleCard`, `QuoteCard`, `StatCard`, `LowerThird`, `ChapterCard`, `EndCard`). They each hold multiple text elements (title + subtitle, quote + author + role). Exposing one prop per slot — `titleFontWeight`, `subtitleFontWeight`, `quoteLetterSpacing`, etc. — balloons the prop surface and is the exact verbosity 007 flagged. Users who need composer-level typography customization compose the primitives directly today; revisit if a theme aggregate (007) is later resumed.
- **`DrawOn`** — renders SVG paths, no text.
- **`Callout`** — its inline label rendering will be brought in as part of a future Callout overhaul; not blocking 014.
- **`WordStagger.justify`** stays as-is (flex-justify-content of word containers). The new `align` prop is `text-align` on inner spans where it makes sense; for `WordStagger` we keep `justify` and skip `align` since they overlap.
- **A `theme` aggregate** — paused 007 territory. 014 adds the typed dimensions; aggregation is a separate decision.
- **A `className` passthrough** — paused 007 territory. Same rationale.

## Goals

1. Every text primitive exposes `fontWeight`, `letterSpacing`, `lineHeight`, and `align` (where applicable) as props.
2. CLAUDE.md §2's brand spec (-0.02 to -0.04em tracking, weight 600) is reachable from prop level, not hardcoded.
3. Zero behavior change when callers omit the new props — defaults preserve every primitive's current rendered output.
4. No new dependencies, no shared-file edits, no breaking changes.

## Reasonable calls (challenge any)

- **String type for `letterSpacing`, not number.** CSS accepts `'-0.02em'`, `'0.16em'`, `'0.5px'`. Forcing a number forces a unit decision (px? em?) — string preserves the CSS contract exactly. Validate non-empty in Zod; the renderer trusts CSS.
- **Number for `lineHeight`.** Unitless `lineHeight` is the React/CSS idiom — multiplies against `fontSize`, scales correctly across `size` roles. A string would invite mixed-unit bugs.
- **`align` is `'left' | 'center' | 'right'`, not `'start' | 'end' | 'center'`.** Onda is left-to-right today; LTR vocab matches what callers will reach for. Add `'start' | 'end'` later if RTL is ever in scope.
- **Defaults preserve current behavior, not the CLAUDE.md ideal.** A primitive that currently renders with default `letterSpacing` keeps doing so. Changing defaults to "tighter tracking by default" would shift the look of every existing scene — silent style migration is the wrong move. Document the recommended values in each component's README instead.
- **Add to primitives, not composers.** Composers compose primitives; whatever a primitive exposes, the composer can pass through. Doing this to primitives also opens the door for composers to expose composite typography props later without re-touching the primitives.
- **Mechanical, parallelizable.** Each primitive is a one-file edit: schema + props destructure + inline `style` extension. No motion changes, no shared-file edits — ideal for parallel agents one component per branch.

## Open questions deferred

- **Should the defaults shift to the CLAUDE.md spec values** (`letterSpacing: '-0.02em'` on display primitives, etc.)? Tempting — but it's a silent visual migration for every existing scene. Could ship as a separate "look refresh" PR once 014's props exist, with a screenshot diff per primitive.
- **`fontStyle` (italic) and `textTransform` (uppercase/lowercase)?** Both are CLAUDE.md-relevant — eyebrows want uppercase. Not in 014's scope; add when a primitive's README starts asking for them.
- **Composer-level typography aggregation** (a single `typography={...}` per composer). Belongs in resumed 007, alongside the `theme` aggregate.
