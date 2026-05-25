# SlotMachineRoll

Each character spins down a reel of glyphs and lands on its target, settling on the house spring — staggered left-to-right so the string resolves like an odometer. The filler glyphs come from a seeded PRNG (`seededRandom`), so the spin is identical every render (§1). Best on short numeric strings (years, counts, prices); defaults to a monospace stack so the reels stay column-aligned.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"2026"` | Text that rolls in. |
| `delay` | `number` | `0` | Frames before rolling. |
| `charDelay` | `number` | `4` | Frames between chars starting. |
| `duration` | `number` | `24` | Frames per reel to settle. |
| `reelLength` | `number` | `12` | Filler glyphs before the target. |
| `seed` | `number` | `7` | Deterministic filler seed. |
| `charset` | `string` | `"0123456789"` | Glyph pool the reel spins. |
| `color` | `string` | `#F2F2F4` | Text color. |
| `fontSize` / `size` | `number` / role | `140` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `letterSpacing`, `align` | — | mono defaults | Typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { SlotMachineRoll } from './components/onda/slot-machine-roll/SlotMachineRoll';

export const YearScene = () => (
  <SlotMachineRoll text="2026" placement="center" />
);
```
