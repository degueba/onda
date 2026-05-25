# DynamicGrid

A technical grid that drifts diagonally — the `GridField` primitive on a frame-driven translate that loops by exactly one cell, so the motion is seamless and deterministic (§1). An optional centered accent `Glow` lifts the middle. A full-canvas atmosphere layer for dashboards, data, and dev scenes.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cell` | `number` | `48` | Cell size in px. |
| `variant` | `'lines' \| 'dots'` | `'lines'` | Ruled grid or dot lattice. |
| `color` | `string` | `#1C1C22` | Grid color. |
| `speed` | `number` | `0.4` | Diagonal drift px/frame. |
| `opacity` | `number` | `0.6` | Grid opacity. |
| `glow` | `boolean` | `true` | Centered accent glow. |
| `glowColor` | `string` | `#D96B82` | Glow color. |
| `background` | `string` | `#08080A` | Canvas color. |

## Usage

```tsx
import { AbsoluteFill } from 'remotion';
import { DynamicGrid } from './components/onda/dynamic-grid/DynamicGrid';

export const Scene = () => (
  <AbsoluteFill>
    <DynamicGrid variant="dots" />
    {/* foreground */}
  </AbsoluteFill>
);
```
