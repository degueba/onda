# NodeGraph

A hub-and-spoke constellation, full-canvas. A labeled central hub rises in on the house spring, then `satellites` fly in from off-frame (seeded directions) and settle into **elliptical orbits** at varying radii and angular speeds — all a pure function of `useCurrentFrame()` and `seed`, so it renders deterministically and loops on the orbital periods (CLAUDE.md §1). Connection lines hub→satellite sit dim, then briefly **light up** in the accent on a deterministic, seeded-phase pulse. An optional soft `Glow` sits behind the hub. Looks complete with zero props (`<NodeGraph />`).

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `hubLabel` | `string` | `"AI"` | Label inside the central hub — a character or short word. |
| `satellites` | `{ label, radius, speed, startAngle }[]` | 5 sample nodes | Each flies in, then orbits. `radius` px, `speed` rad/frame (signed), `startAngle` rad. |
| `accent` | `string` | `#D96B82` | Earned accent — hub tint, ring, and the lighting-up lines. |
| `ellipse` | `number` | `0.62` | Vertical squash of every orbit (1 = circular). |
| `seed` | `number` | `7` | Drives fly-in directions and the connection-pulse phases. |
| `delay` | `number` | `0` | Frames before the constellation assembles. |
| `glow` | `boolean` | `true` | Soft accent glow behind the hub. |
| `hubDiameter` | `number` | `120` | Hub node diameter in px. |
| `hubFontSize` | `number` | `34` | Hub label size in px; wins over `hubSize`. |
| `hubSize` | size role | — | Semantic role for the hub label → canvas-aware px. |
| `background` | `string` | `#08080A` | Canvas color behind the constellation. |
| `fontFamily` | `string` | Clash Display | Font for every label. |
| `placement` | region or `{x,y,anchor}` | `center` | Where the hub (and its orbits) is centered. |

## Usage

```tsx
import { Sequence } from 'remotion';
import { NodeGraph } from './components/onda/node-graph/NodeGraph';

export const ConstellationScene = () => (
  <Sequence durationInFrames={240}>
    <NodeGraph
      hubLabel="AI"
      satellites={[
        { label: 'data',   radius: 260, speed: 0.010, startAngle: 0.4 },
        { label: 'model',  radius: 340, speed: -0.007, startAngle: 1.7 },
        { label: 'render', radius: 210, speed: 0.013, startAngle: 2.9 },
        { label: 'audio',  radius: 380, speed: -0.006, startAngle: 4.1 },
        { label: 'scene',  radius: 300, speed: 0.009, startAngle: 5.3 },
      ]}
    />
  </Sequence>
);
```
