# Parallax

Slow horizontal or vertical drift over an image. A lighter, no-zoom complement to `KenBurns` — same constant cinematic feel, but used where the image is supposed to stay in the background and let other elements lead. Default: 40px drift over 6 seconds, leftward. The image rides a 1.05 scale so the translation never exposes the canvas edge.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | `"https://picsum.photos/seed/onda-parallax/1920/1080"` | Image URL. The Picsum seed is for the playground only — supply your own `src` in real compositions. |
| `delay` | `integer ≥ 0` | `0` | Frames before the drift starts. |
| `duration` | `integer ≥ 1` | `180` | Frames the drift takes (6s @ 30fps). Parallax wants time; shortening reads as a swipe. |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | The edge the image drifts *toward* as time advances. |
| `distance` | `number` | `40` | Total drift in pixels across `duration`. Keep restrained — large values stop reading as parallax. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Region (`"center"`, `"upper-third"`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. |

## Usage

```tsx
import { Composition } from 'remotion';
import { Parallax, parallaxSchema } from './components/onda/parallax/Parallax';

export const Root: React.FC = () => (
  <Composition
    id="ParallaxBackdrop"
    component={Parallax}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
    schema={parallaxSchema}
    defaultProps={{
      src: 'https://picsum.photos/seed/onda-parallax/1920/1080',
      delay: 0,
      duration: 180,
      direction: 'left',
      distance: 40,
    }}
  />
);
```

## Motion notes

- **Linear by design.** `Parallax` joins the linear-by-design club with `KenBurns`, `Marquee`, and `Typewriter`. At a 6-second scale a spring or ease would read as the camera accelerating or settling — wrong for parallax, which is steady throughout. Restraint here means *constant* motion, not *eased* motion.
- **Restrained distance.** 40px over 6 seconds is a slow, ambient drift — the eye registers movement without feeling pushed. Going past ~120px starts to read as a pan or a swipe, not parallax.
- **`scale(1.05)` is intentional.** The image is rendered slightly oversized so that any translation up to `distance` still fills the canvas. Without it, drifting left would expose the right edge.
- **`<Img>` (not raw `<img>`).** The component uses Remotion's `<Img>`, which `delayRender`s until the image loads and auto-retries on failure. Safe for headless renders with network-sourced photos.
- **`overflow: hidden` on the `AbsoluteFill`** is critical — without it, the scaled-and-translated image bleeds beyond the canvas bounds.
- All `interpolate` calls clamp on both sides — the component is correct on frame 0 and on any frame past `delay + duration` (the image rests at the final offset).
