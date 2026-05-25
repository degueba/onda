# RgbGlitchText

RGB channel-split text — a red and a cyan copy ride just off the white center (composited with `mix-blend-mode: screen`), with periodic glitch bursts that kick the split wider and add vertical jitter. The burst jitter is a pure function of a seeded PRNG (`seededRandom`) keyed by the frame bucket, so it renders identically every time (§1). High-energy by design — the baseline split stays restrained so the bursts read as punctuation, not noise.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"GLITCH"` | Text to glitch. |
| `delay` | `number` | `0` | Frames before the effect. |
| `baseSplit` | `number` | `2` | Always-on channel split (px). |
| `intensity` | `number` | `10` | Peak extra split during a burst. |
| `glitchPeriod` | `number` | `48` | Frames between bursts. |
| `glitchDuration` | `number` | `8` | Frames a burst lasts. |
| `seed` | `number` | `7` | Deterministic jitter seed. |
| `color` / `redColor` / `cyanColor` | `string` | text / red / cyan | Center + channel colors. |
| `fontSize` / `size` | `number` / role | `120` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `letterSpacing`, `align` | — | display defaults | Typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

> Composited with `screen` blend — designed for the dark Onda canvas.

## Usage

```tsx
import { RgbGlitchText } from './components/onda/rgb-glitch-text/RgbGlitchText';

export const GlitchScene = () => (
  <RgbGlitchText text="SIGNAL" placement="center" />
);
```
