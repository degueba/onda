# WordStagger

Multi-word text where each word fades and rises in sequence. Words are split on whitespace and each one runs the canonical `entryFadeRise` choreography offset by `STAGGER` frames — the clearest demonstration of the Onda stagger fingerprint. No overshoot, small travel, calm settle.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"motion that moves you"` | Whitespace splits into words. Empty entries are dropped so stray spaces don't create ghost beats. |
| `delay` | `integer ≥ 0` | `0` | Frames before the FIRST word starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Per-word reveal duration. |
| `stagger` | `integer ≥ 0` | `STAGGER` (4) | Frames between successive words. The canonical Onda value — change only with intent. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `64` | Pixels. Smaller than `BlurReveal`'s 96 because multi-word lines occupy more horizontal space. Wins over `size` if both are passed. |
| `size` | `SizeRole?` | – | Semantic typography role — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `placement` | `Placement` | `'center'` | Where on the canvas the phrase sits. Pass a region (`'center'`, `'upper-third'`, `'top-right'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { WordStagger, wordStaggerSchema } from './components/onda/word-stagger/WordStagger';

export const Root: React.FC = () => (
  <Composition
    id="MyWordStagger"
    component={WordStagger}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={wordStaggerSchema}
    defaultProps={{
      text: 'motion that moves you',
      delay: 0,
      duration: 18,
      stagger: 4,
      color: '#F2F2F4',
      fontSize: 64,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Each word's entrance is `entryFadeRise` from `lib/choreography.ts` — the workhorse default entrance (spring-driven translate up + fade, no overshoot). Composing the existing pattern keeps every Onda reveal on the same physical curve.
- The `stagger` default is `STAGGER` from `lib/motion.ts` — `4` frames @ 30fps (≈ 0.13s). This is THE canonical inter-sibling stagger across Onda; restrained enough to feel deliberate, fast enough that a 5-word line completes inside ~1.2s. Use `staggerFrames(i, stagger)` to compute the per-word offset so the value stays greppable.
- Layout is `display: flex` with `flexWrap: 'wrap'` and `gap: '0.3em'`. The `em`-relative gap scales with `fontSize`, so the visual rhythm between words holds whether the line is 32px or 160px. At very small font sizes a wider gap can read as a tracked-out caption; at very large sizes a tighter gap can crowd descenders — adjust only when the composition needs it.
- Each word is an `inline-block` `<span>` so the per-word `transform: translateY(...)` from `entryFadeRise` applies. Inline layout would ignore it.
- All `interpolate` calls inside `entryFadeRise` clamp at both ends, so the component is correct on frame 0 and on any frame past the last word's `delay + duration`.
