# TextFadeReplace

Cycles through a list of phrases, crossfading one into the next in place. Both the outgoing and incoming phrase are layered (with an invisible spacer reserving height) so the swap never shifts the layout. A calm `HOUSE_EASE` crossfade — for rotating taglines, value props, or "X, then Y, then Z" beats.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `phrases` | `string[]` | `["ship","render","repeat"]` | Phrases, in order. |
| `interval` | `number` | `45` | Frames each phrase holds. |
| `crossfade` | `number` | `12` | Frames of crossfade between phrases. |
| `delay` | `number` | `0` | Frames before the first phrase. |
| `loop` | `boolean` | `true` | Loop after the last phrase. |
| `color` | `string` | `#F2F2F4` | Text color. |
| `fontSize` / `size` | `number` / role | `96` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `letterSpacing`, `lineHeight`, `align` | — | display defaults | Typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { TextFadeReplace } from './components/onda/text-fade-replace/TextFadeReplace';

export const TaglineScene = () => (
  <TextFadeReplace phrases={['Plan', 'Render', 'Ship']} placement="center" />
);
```
