# Techspec 020 — Typography text-props completion

> Tracks [#24](https://github.com/degueba/onda/issues/24).

## Problem

The recent typography uniformity work (techspec 014) added `letterSpacing`, `fontWeight`, `lineHeight`, and `align` to every typography-rendering component. Four CSS text-styling primitives were left out and consumers hit the gap immediately: `textTransform` (uppercase eyebrow / kicker copy), `textShadow` (readability over busy hero backgrounds), `fontStyle` (italic emphasis, quoted attributions), and `textWrap` (modern line-balancing for headlines and bodies). Without them, consumers either fork the components or skip Onda's reveal primitives entirely on text where these styles are required — exactly the kind of "drop in and use" friction the uniformity work was meant to eliminate.

## Decision

Add four new optional props — `textTransform`, `textShadow`, `fontStyle`, `textWrap` — to every typography-rendering component, applied as inline styles on the rendered text element. Defaults are `undefined` (no behavior change for existing consumers).

The issue originally proposed three (`textTransform` / `textShadow` / `fontStyle`); `textWrap` was added during implementation as the only modern CSS text prop that genuinely belongs in a "complete" typography surface. `text-wrap: balance` produces visibly better headline line-breaks (typographically important for hero copy) and `pretty` does the same for bodies — both widely supported in evergreen browsers since 2024. Cheap addition (same shape, same files), real quality win.

Schema additions (identical across all 8 components):

```ts
/** CSS text-transform. Useful for eyebrow / kicker copy. */
textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
/** CSS text-shadow value (e.g. `'0 4px 24px rgba(0,0,0,0.55)'`). */
textShadow: z.string().optional(),
/** CSS font-style. */
fontStyle: z.enum(['normal', 'italic', 'oblique']).optional(),
/** CSS text-wrap. `'balance'` evens out headline line-breaks; `'pretty'` polishes body text. */
textWrap: z.enum(['wrap', 'nowrap', 'balance', 'pretty']).optional(),
```

Affected components, all under `registry/components/`:

- `typewriter/` — `Typewriter.tsx` + `schema.ts`
- `word-stagger/` — `WordStagger.tsx` + `schema.ts`
- `fade-in/` — `FadeIn.tsx` + `schema.ts`
- `slide-in/` — `SlideIn.tsx` + `schema.ts`
- `blur-reveal/` — `BlurReveal.tsx` + `schema.ts`
- `rotate-in/` — `RotateIn.tsx` + `schema.ts`
- `scale-in/` — `ScaleIn.tsx` + `schema.ts`
- `mask-reveal/` — `MaskReveal.tsx` + `schema.ts`

## Goals

- Same three props available on every typography-rendering component
- Zero behavior change when the props aren't passed (undefined defaults pass through CSS naturally)
- Schemas reachable from the runtime manifest so agents see the new props automatically
- No new dependencies, no design surface to maintain — pure pass-through to the text element's inline style

## Non-goals

- **Not adding `textDecoration`** — Onda has a dedicated `Underline` component with animated draw-on + accent color + line thickness; inline `textDecoration` would compete with it.
- **Not adding `whiteSpace`, `textOverflow`, `fontStretch`, `fontVariantNumeric`** — niche for motion graphics. `fontVariantNumeric: 'tabular-nums'` is already baked into `CountUp` where it actually matters.
- **Not adding animated transitions of these properties** — these are static styling props, not motion targets.
- **Not touching composer components** (`TitleCard`, `LowerThird`, `StatCard`, `Callout`, `QuoteCard`, `Captions`, `Highlight`, `ChapterCard`) — they delegate text rendering to the inner primitives above, and gain the new capability transitively without a separate prop surface.

## Reasonable calls (challenge any)

- **Same three props on every typography component, even where one rarely makes sense.** `textShadow` on `Typewriter` reads weird in some compositions, but the uniformity rule from techspec 015 (real-library uniformity) says every renderable component supports the same vocabulary. Tier-ing components by which props they get is the wrong instinct.
- **Z-enum on `textTransform` and `fontStyle`, free `string` on `textShadow`.** The first two have finite valid CSS values; an enum gives agents structured choices. `textShadow` is open-ended ("0 4px 24px rgba(...)") — enum-ing it would arbitrarily restrict.
- **No defaults.** A default of `'none'` for `textTransform` would litter compositions with explicit `textTransform: 'none'` lines. Leaving it `undefined` means the inline style attribute is simply absent, which is the cleanest CSS — the browser inherits whatever the cascade dictates.
- **Inline styles, not a `style` prop passthrough.** Onda components explicitly reject `style` / `className` passthrough ("report don't escape-hatch" — see CLAUDE.md). These three props are the typed answer for the styles consumers reach for repeatedly.

## Open questions

None — the issue is fully scoped and the pattern is mechanical.
