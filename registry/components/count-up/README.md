# CountUp

An animated number that counts from `from` to `to` over `duration` while fading in. Both the opacity and the numeric value ride the same `SPRING_SMOOTH` curve, so the fade-in and the count settle together as one calm motion — no overshoot, no race. Tabular numerals keep each digit slot a fixed width so the value doesn't visibly shift left and right as digits change, and the output is locale-grouped (`en-US`) by default so large numbers read as `12,345` rather than `12345`.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `from` | `number` | `0` | Starting value. |
| `to` | `number` | `100` | Ending value. |
| `delay` | `integer ≥ 0` | `0` | Frames before the animation starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Target frames to reach `to`. Counting wants more time than a text fade — defaults to `slow`, not `base`. |
| `decimals` | `integer ≥ 0` | `0` | Fraction digits to render. The same value is used as both `minimumFractionDigits` and `maximumFractionDigits` so the digit count is stable across frames. |
| `prefix` | `string` | `""` | Rendered before the number, e.g. `"$"`. |
| `suffix` | `string` | `""` | Rendered after the number, e.g. `"%"`. |
| `color` | `string` | `"#F2F2F4"` | Text color — defaults to `--onda-text`. |
| `fontSize` | `number` | `120` | Pixels. Counters are usually large. Wins over `size` if both are passed. |
| `size` | `SizeRole?` | – | Semantic typography role — `'hero'` \| `'heading'` \| `'subheading'` \| `'body'` \| `'caption'`. Resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | `'"Clash Display", sans-serif'` | The Onda display font. Never default to Inter / Arial / system. |
| `placement` | `Placement` | `'center'` | Where on the canvas the number sits. Pass a region (`'center'`, `'upper-third'`, `'top-right'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { CountUp, countUpSchema } from './components/onda/count-up/CountUp';

export const Root: React.FC = () => (
  <Composition
    id="MyCounter"
    component={CountUp}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={countUpSchema}
    defaultProps={{
      from: 0,
      to: 12500,
      delay: 0,
      duration: 24,
      decimals: 0,
      prefix: '$',
      suffix: '',
      color: '#F2F2F4',
      fontSize: 120,
      fontFamily: '"Clash Display", sans-serif',
    }}
  />
);
```

## Motion notes

- Opacity comes from `entryFade` in `lib/choreography.ts` — opacity 0→1 on `SPRING_SMOOTH`, no transform, no overshoot.
- The numeric value rides the **same** `SPRING_SMOOTH` curve at the same `durationInFrames`, computed independently so we can map its progress onto `[from, to]`. The fade and the count therefore settle together rather than racing each other.
- Duration defaults to `DURATION.slow` (24 frames ≈ 0.8s at 30fps). Numbers benefit from a slightly longer settle than a text reveal — the eye needs time to track digits flowing into place.
- `fontVariantNumeric: 'tabular-nums'` keeps every digit slot a fixed width so the number doesn't shift horizontally as digits change. Without this, an animating `12,345` would visibly jitter left and right.
- Formatting uses `value.toLocaleString('en-US', …)` — `en-US` is fixed so the render is deterministic across machines regardless of host locale.
- All `interpolate` calls clamp at both ends — the component is correct on frame 0 and on any frame past `delay + duration`.
