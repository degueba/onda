# BrowserFrame

A browser chrome (three dots + an address pill) that wraps arbitrary content. Pass `children` (JSX), an image `src`, or neither (a neutral placeholder showing the URL). It is a **container** — the documented exception to the component contract's "self-contained" rule, since wrapping content is its entire purpose. It scales-and-fades in on the house spring.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `url` | `string` | `"onda.video"` | Address-pill text. |
| `src` | `string?` | — | Image to show when no children. |
| `children` | `ReactNode?` | — | Content to wrap (JSX only). |
| `delay` | `number` | `0` | Frames before entrance. |
| `animate` | `boolean` | `true` | Scale-and-fade in. |
| `width` | `number` | `1280` | Frame width. |
| `height` | `number` | `720` | Content height (excl. chrome). |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { BrowserFrame } from './components/onda/browser-frame/BrowserFrame';

export const SiteScene = () => (
  <BrowserFrame url="onda.video" src="/screenshot.png" placement="center" />
);
```
