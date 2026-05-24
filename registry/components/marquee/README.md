# Marquee

A seamless looping horizontal scroll — logo strips, ticker tape, "as featured in" rows. Slow and restrained on purpose: the Onda brand is *not* a frantic stock ticker. Atmospheric by design, it provides quiet context behind or beneath the foreground without competing for attention.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `string[]` | `['REMOTION', 'TYPESCRIPT', 'REACT', 'TAILWIND', 'NEXT.JS', 'PNPM']` | The strings to scroll. Repeated 3× internally for a seamless loop. |
| `speed` | `number` | `30` | Pixels per second. Low and restrained — anything over ~80 starts to feel frantic. |
| `direction` | `'left' \| 'right'` | `'left'` | Travel direction. |
| `gap` | `integer ≥ 0` | `64` | Pixels between items. |
| `color` | `string` | `"#56565F"` | Defaults to `--onda-faint`. Marquees should not shout — use secondary text, not headline. |
| `fontSize` | `number` | `32` | Pixels. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Marquee, marqueeSchema } from './components/onda/marquee/Marquee';

export const Root: React.FC = () => (
  <Composition
    id="MyMarquee"
    component={Marquee}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={120}
    schema={marqueeSchema}
    defaultProps={{
      items: ['REMOTION', 'TYPESCRIPT', 'REACT', 'TAILWIND', 'NEXT.JS', 'PNPM'],
      speed: 30,
      direction: 'left',
      gap: 64,
      color: '#56565F',
      fontSize: 32,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- **Linear by design.** Marquee uses linear translation — `offset = (frame / fps) * speed` — and intentionally does *not* use `spring()`. Spring acceleration on a continuous scroll feels uneven and broken: the row appears to surge and settle instead of gliding. Alongside `Typewriter` and `KenBurns`, this is one of the few Onda primitives where linear motion is correct. The restraint stays in the brand via the low default `speed` (30 px/s), not via easing.
- **Seamless loop technique: render 3×, modulo by one set.** The `items` array is repeated three times in the inner row so there is always content covering the viewport no matter where the wrapped offset lands. Translation is taken modulo the width of **one** set, so the row snaps back invisibly each cycle. The seam is hidden by the 3× overlap.
- **Width is approximated, not measured.** Remotion renders deterministically: we cannot use `useState` / `useEffect` / DOM measurement to learn the row's true width. Instead the per-set width is estimated as `items.reduce((w, item) => w + item.length * fontSize * 0.6 + gap, 0)`. The `0.6` factor is an average character width for proportional fonts — close enough that the snap-back lands inside the 3× overlap zone for any reasonable list. Monospace or very wide/narrow font choices may need a small `speed` or `gap` tweak if a visible seam ever appears.
- **No `useState`, no `useEffect`, no `Math.random` / `Date.now`.** The offset is a pure function of `useCurrentFrame()` and `useVideoConfig().fps`. Frame N renders identically every time.
