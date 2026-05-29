# Theming — bring your own brand

Onda's palette and fonts are the **default** look, not an enforced one. Every
component reads its colors and fonts from CSS variables, so you can re-skin the
whole catalog with your own brand — your palette, your type, Onda's motion.

Try it live on the [Brand playground](/brand).

## How it works

Each component defaults its color / font props to a **`var()` token** with the
Onda value as the fallback — for example the accent default is
`'var(--onda-accent, #D96B82)'`. So:

- **Do nothing** → components render in the Onda palette (the fallbacks).
- **Set the `--onda-*` variables** on any ancestor → everything beneath re-skins.

Because the variable is read at render time, there's no per-component wiring:
set the variable once at a root and every Onda component inside follows.

## The overridable slots

Only **surface** slots are themeable — color and type. Motion (springs, easing,
timing, stagger) is Onda's signature and is **not** overridable.

| Variable | Token | Default |
|----------|-------|---------|
| `--onda-bg` | background | `#08080A` |
| `--onda-surface` | raised surface | `#0E0E12` |
| `--onda-surface-2` | secondary surface | `#121217` |
| `--onda-border` | border | `#1C1C22` |
| `--onda-border-lit` | hover / focus border | `#26262E` |
| `--onda-text` | primary text | `#F2F2F4` |
| `--onda-dim` | secondary text | `#8E8E98` |
| `--onda-faint` | labels / captions | `#56565F` |
| `--onda-accent` | the earned accent | `#D96B82` |
| `--onda-accent-soft` | lighter accent step | `#E89AAB` |
| `--onda-font-display` | display / headings | `"Clash Display", sans-serif` |
| `--onda-font-body` | body / UI | `"Space Grotesk", sans-serif` |

## Applying a brand

### Plain CSS (no imports)

Components added via `ondajs add` are copied as source that already reads the
variables, so the simplest path is to set them in your own CSS — including
pointing the font variables at **any font you've loaded in your project**
(Google Fonts, `@fontsource`, `next/font`, a local `@font-face`, anything):

```css
:root {
  --onda-accent: #6366f1;
  --onda-text: #f4f4f8;
  --onda-bg: #0b0b12;
  --onda-font-display: "Inter", sans-serif;
  --onda-font-body: "Inter", sans-serif;
}
```

Scope it to a wrapper instead of `:root` to theme just one region.

### Typed helpers (from the lib)

Prefer a typed object? Onda's `lib` ships a `Brand` schema and the
`brandToCssVars()` / `<ThemeProvider>` helpers (the same ones the renderer
uses) — import them from the Onda lib in your project. The CSS approach above
needs no imports at all.

```tsx
import { brandToCssVars, ThemeProvider } from '@/lib/theme'; // the Onda lib in your project

const brand = {
  accent: '#6366F1',
  text: '#F4F4F8',
  bg: '#0B0B12',
  fontDisplay: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif',
};

// Spread the CSS variables onto any element…
<div style={brandToCssVars(brand)}>{/* Onda components re-skin here */}</div>;

// …or use the provider wrapper:
<ThemeProvider brand={brand}>{/* … */}</ThemeProvider>;
```

### In a composition

`CompositionRenderer` takes a `brand` prop that applies the variables at the
composition root, so renders (preview and export) pick up the brand:

```tsx
<CompositionRenderer composition={payload} registry={registry} brand={brand} />
```

## Fonts

You are responsible for loading whatever font you reference — Onda only sets the
`font-family`. Load it however your project already does (Google Fonts link,
`@fontsource`, `next/font`, local `@font-face`), then point `--onda-font-display`
/ `--onda-font-body` at it. Unset, they fall back to Onda's Clash Display /
Space Grotesk.

## Authoring components

When you build a component, default every color / font prop to a `THEME.*` token
from `lib/tokens.ts` — never a raw hex or font string — so it responds to brand
overrides out of the box:

```ts
import { THEME } from '@onda/lib/tokens'; // or the copied lib path in a consumer project

accent: z.string().default(THEME.accent),          // 'var(--onda-accent, #D96B82)'
fontFamily: z.string().default(THEME.fontDisplay),  // 'var(--onda-font-display, "Clash Display", …)'
```
