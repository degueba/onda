# Techspec 016 — Per-slot typography on composers

## Problem

[014](../014-typography-prop-extensions/design.md) added `fontWeight`, `letterSpacing`, `lineHeight`, and `align` to every text-rendering primitive. The six scene-block composers (`TitleCard`, `StatCard`, `QuoteCard`, `LowerThird`, `ChapterCard`, `EndCard`) were explicitly left out — 014 deferred composer-level typography to a future "theme aggregate" decision (paused 007).

The composers already expose per-slot `<slot>FontSize` / `<slot>Size` / `<slot>Color` props (e.g. `titleFontSize`, `subtitleColor`, `labelSize`). The typography vocabulary stops there. A developer or agent who wants a 500-weight subtitle in a `TitleCard`, a tighter `letterSpacing` on a `StatCard` value, or a relaxed `lineHeight` on a `QuoteCard` body has to fork the composer file — there's no typed prop for it.

That's the exact "forking the file" failure mode the typed-prop side of 007 was meant to prevent. The fix is mechanical and uses the pattern the composers already use for size / color.

## Principle

**Every text slot in a composer accepts the full typography vocabulary.** If a slot has `<slot>FontSize` and `<slot>Color`, it also has `<slot>FontWeight`, `<slot>LetterSpacing`, and `<slot>LineHeight`. The composer plumbs them straight through to the internal primitive that renders the slot — which already accepts them from 014.

No top-level `fontWeight` / `letterSpacing` / `lineHeight` on the composer. Those would be ambiguous: which slot do they apply to? Per-slot only, named consistently with the existing `<slot><Dimension>` pattern.

## Audit

| Composer | Slot | Internal primitive | New props |
| --- | --- | --- | --- |
| `TitleCard` | `title` | `Underline` / `BlurReveal` | `titleFontWeight`, `titleLetterSpacing`, `titleLineHeight` |
| `TitleCard` | `subtitle` | `WordStagger` | `subtitleFontWeight`, `subtitleLetterSpacing`, `subtitleLineHeight` |
| `StatCard` | `value` | `CountUp` | `valueFontWeight`, `valueLetterSpacing`, `valueLineHeight` |
| `StatCard` | `label` | `WordStagger` | `labelFontWeight`, `labelLetterSpacing`, `labelLineHeight` |
| `QuoteCard` | `quote` | `WordStagger` | `quoteFontWeight`, `quoteLetterSpacing`, `quoteLineHeight` |
| `QuoteCard` | `author` (covers role) | `FadeIn` × 2 | `authorFontWeight`, `authorLetterSpacing`, `authorLineHeight` |
| `LowerThird` | `name` | `SlideIn` | `nameFontWeight`, `nameLetterSpacing`, `nameLineHeight` |
| `LowerThird` | `role` | `FadeIn` | `roleFontWeight`, `roleLetterSpacing`, `roleLineHeight` |
| `ChapterCard` | `number` | `FadeIn` | `numberFontWeight`, `numberLetterSpacing`, `numberLineHeight` |
| `ChapterCard` | `title` | `BlurReveal` | `titleFontWeight`, `titleLetterSpacing`, `titleLineHeight` |
| `EndCard` | `cta` | `Underline` / `BlurReveal` | `ctaFontWeight`, `ctaLetterSpacing`, `ctaLineHeight` |
| `EndCard` | `handles` | `StaggerGroup` | `handlesFontWeight`, `handlesLetterSpacing`, `handlesLineHeight` |

Note on the `StatCard` slots: existing props use `numberFontSize` / `labelFontSize`. The brief specified slot names `value` / `label`; the existing public surface uses `number` / `label`. **Mirror the existing names**: `numberFontWeight`, `labelFontWeight`. The composer already shipped its public vocabulary.

Note on `QuoteCard`: `author` and `role` render through two `FadeIn` calls that share `authorFontSize` / `authorColor`. New props use the same grouping — `authorFontWeight` flows into both.

Note on `EndCard.handles`: the slot is rendered by `StaggerGroup`, which 014 skipped because it doesn't own its own text style block (it's a layout-with-children primitive that sets `fontWeight: 600` on the wrapper). Extend `StaggerGroup` with the same three optional props as part of this spec — small, mechanical, follows the 014 shape, gives the composer a clean plumbing target.

## Decision

For each slot, add three optional Zod props (Zod-first per CLAUDE.md §4):

```ts
/** Font weight for the <slot>. */
<slot>FontWeight: z.number().optional(),
/** CSS letter-spacing for the <slot> (e.g. `'-0.02em'`). */
<slot>LetterSpacing: z.string().optional(),
/** Unitless line height for the <slot>. */
<slot>LineHeight: z.number().optional(),
```

Then pass each through to the relevant internal primitive: `<Primitive ... fontWeight={titleFontWeight} letterSpacing={titleLetterSpacing} lineHeight={titleLineHeight} />`. Because each primitive's prop is `.optional()` with a destructure default (`fontWeight = 600`), passing `undefined` preserves current behavior exactly.

## Non-goals

- **No `<slot>Align`.** Alignment is decided by the composer's flex container, not the inner primitive's `text-align`. Adding `align` per slot would create two competing layout systems.
- **No theme aggregate.** That's resumed [007](../007-component-theming-api/design.md). 016 is the typed-prop half, same as 014 was for primitives.
- **No top-level `fontWeight` / `letterSpacing` / `lineHeight` on the composer.** Ambiguous — which slot does it apply to? Per-slot keeps the contract sharp.
- **No README updates in this batch.** Docs sweep follows separately.
- **No `fontStyle` / `textTransform`.** Same deferral as 014.

## Goals

1. Every text slot in every composer exposes `<slot>FontWeight`, `<slot>LetterSpacing`, `<slot>LineHeight` as optional props.
2. Zero behavior change when callers omit them — `undefined` passes through to primitives whose destructure defaults take over.
3. `StaggerGroup` brought into the same typography contract so `EndCard.handles` has a clean plumbing target.
4. No new dependencies, no breaking changes, no motion changes.

## Reasonable calls (challenge any)

- **Per-slot naming over a `typography={}` aggregate.** The composers already use `<slot><Dimension>` everywhere else (`titleFontSize`, `labelColor`, `numberSize`). Mirroring that pattern keeps the composer surface internally consistent and avoids inventing a new vocabulary just for the three new dimensions.
- **`StaggerGroup` extended here, not held as a separate spec.** It's three lines of schema + destructure + style — under the spec's "mechanical, follows existing pattern" budget. Splitting it into its own spec would balloon the queue for no review benefit.
- **Mirror existing slot names (`number`, not `value`; `cta`, not the brief's hint).** Composer prop names are part of the public contract. The brief described slots semantically; the implementation uses whatever name the composer already ships (`numberFontSize` → `numberFontWeight`).
- **No alignment prop.** Composers center via flex; passing `text-align` to the inner primitive would only matter for multi-line wrapping inside a slot. None of the six composers render slots that wrap (the only wrapping case is `QuoteCard.quote`, which uses `WordStagger.justify`).
