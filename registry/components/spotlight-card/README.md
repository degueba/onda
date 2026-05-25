# SpotlightCard

A glass card (`Surface`) with a spotlight (`Glow`) that drifts slowly behind the content on a frame-driven path. The card rises in on the house spring; the spotlight keeps moving so the surface feels alive without anything competing for attention. Eyebrow + title + body, all token-styled.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `eyebrow` | `string` | `"FEATURE"` | Uppercase kicker; empty hides it. |
| `title` | `string` | `"Motion identity"` | Headline (display font). |
| `body` | `string` | sample | Supporting copy; empty hides it. |
| `delay` | `number` | `0` | Frames before entrance. |
| `glowColor` | `string` | `#D96B82` | Drifting spotlight color. |
| `width` | `number` | `560` | Card width. |
| `padding` | `number` | `48` | Inner padding. |
| `align` | `'left' \| 'center'` | `'left'` | Text alignment. |
| `fontFamily` | `string` | Clash Display | Title font. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { SpotlightCard } from './components/onda/spotlight-card/SpotlightCard';

export const FeatureScene = () => (
  <SpotlightCard eyebrow="FEATURE" title="Motion identity" placement="center" />
);
```
