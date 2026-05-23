# KenBurns

Slow zoom-and-pan over a photo — the iconic documentary motion named after filmmaker Ken Burns. A still image gains life through a restrained scale ramp (1.0 → 1.1 over 5 seconds by default) while the transform-origin glides from `(fromX, fromY)` to `(toX, toY)`. The first Onda **cinematic** primitive, and the catalog's first image primitive.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | `"https://picsum.photos/seed/onda/1920/1080"` | Image URL. The Picsum seed is for the playground only — supply your own `src` in real compositions. |
| `delay` | `integer ≥ 0` | `0` | Frames before the motion starts. |
| `duration` | `integer ≥ 1` | `150` | Frames the pan-and-zoom takes (5s @ 30fps). Ken Burns wants time; don't shorten this without reason. |
| `fromScale` | `number` | `1.0` | Starting scale. |
| `toScale` | `number` | `1.1` | Ending scale. Subtle zoom-in by default; keep restrained — large scale jumps read as a push-in, not a Ken Burns. |
| `fromX` | `number ∈ [0, 1]` | `0.5` | Transform-origin X at frame 0. `0` = left edge, `1` = right edge. |
| `fromY` | `number ∈ [0, 1]` | `0.5` | Transform-origin Y at frame 0. `0` = top edge, `1` = bottom edge. |
| `toX` | `number ∈ [0, 1]` | `0.5` | Transform-origin X at frame `duration`. |
| `toY` | `number ∈ [0, 1]` | `0.5` | Transform-origin Y at frame `duration`. |

## Usage

```tsx
import { Composition } from 'remotion';
import { KenBurns, kenBurnsSchema } from './components/onda/ken-burns/KenBurns';

export const Root: React.FC = () => (
  <Composition
    id="KenBurnsHero"
    component={KenBurns}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    schema={kenBurnsSchema}
    defaultProps={{
      src: 'https://picsum.photos/seed/onda/1920/1080',
      delay: 0,
      duration: 150,
      fromScale: 1.0,
      toScale: 1.1,
      // Pan from top-left toward bottom-right while zooming in.
      fromX: 0.3,
      fromY: 0.3,
      toX: 0.7,
      toY: 0.7,
    }}
  />
);
```

## Motion notes

- **Linear by design.** Unlike most Onda primitives (which use `SPRING_SMOOTH` or `HOUSE_EASE`), KenBurns uses raw linear `interpolate`. A spring or ease at a 5-second scale would feel like the camera is accelerating or decelerating — wrong for Ken Burns, which is steady throughout. Restraint here means *constant* motion, not *eased* motion.
- **Pan convention.** `fromX/fromY` is the transform-origin at frame 0; `toX/toY` is the origin at frame `duration`. `(0, 0)` is the top-left of the image, `(1, 1)` is the bottom-right. To pan diagonally down-right while zooming in, set `fromX: 0.3, fromY: 0.3, toX: 0.7, toY: 0.7`. Set both pairs equal (e.g. all `0.5`) for a pure centered zoom.
- **Restrained scale by default.** `1.0 → 1.1` is a 10% zoom over 5 seconds — the eye registers movement without feeling pushed. Going past `1.25` for a 5s shot starts to read as gimmicky.
- **`<Img>` (not raw `<img>`).** The component uses Remotion's `<Img>`, which `delayRender`s until the image loads and auto-retries on failure. This is what makes a network-sourced photo safe to render headlessly.
- **`overflow: hidden` on the `AbsoluteFill`** is critical — without it, the scaled image bleeds beyond the canvas bounds.
- All `interpolate` calls clamp on both sides — the component is correct on frame 0 and on any frame past `delay + duration` (the image rests at `toScale` / `toX, toY`).
