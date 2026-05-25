# MatrixDecode

Each character flickers through random glyphs, then settles to its target left-to-right — a decode reveal. The flicker is **deterministic**: glyph picks come from a seeded PRNG (`seededRandom`) keyed by character index + frame bucket, so the same seed renders the same flicker every time (§1). Still-scrambling glyphs carry the accent; settled text goes neutral. Defaults to a monospace stack so the width stays steady while glyphs swap.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"ONDA"` | Text that decodes in. |
| `delay` | `number` | `0` | Frames before decoding. |
| `charDelay` | `number` | `3` | Frames between chars settling. |
| `scrambleDuration` | `number` | `18` | Frames each char scrambles. |
| `scrambleSpeed` | `number` | `2` | Frames between glyph swaps. |
| `seed` | `number` | `7` | Deterministic glyph seed. |
| `charset` | `string` | A–Z 0–9 symbols | Glyph pool. |
| `color` / `scrambleColor` | `string` | text / accent | Settled vs scrambling color. |
| `fontSize` / `size` | `number` / role | `120` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `letterSpacing`, `align` | — | mono defaults | Typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { MatrixDecode } from './components/onda/matrix-decode/MatrixDecode';

export const DecodeScene = () => (
  <MatrixDecode text="DECODED" placement="center" />
);
```
