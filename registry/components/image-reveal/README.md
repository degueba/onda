# ImageReveal

An image that enters with one of Onda's signature motion fingerprints. Wraps Remotion's `<Img>` and applies the catalog's house spring (`SPRING_SMOOTH`, no overshoot) via the chosen `motion` variant: a blur falloff matching `BlurReveal`, a clean opacity fade, or a subtle scale-in. The default behavior fills the canvas (matching `KenBurns` / `Parallax`); pass `placement` to position the image as a sub-canvas element.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | Picsum seed URL | URL or path to the image. The default is a stable Picsum seed so the playground render is reproducible — supply your own `src` in real compositions. |
| `alt` | `string` | `""` | Accessible alt text. |
| `delay` | `integer ≥ 0` | `0` | Frames before the reveal starts. |
| `duration` | `integer ≥ 1` | `DURATION.base` (18) | Frames to fully reveal. |
| `motion` | `'blur' \| 'fade' \| 'scale'` | `'blur'` | Which Onda motion fingerprint the entrance uses. `'blur'` mirrors `BlurReveal` (opacity + blur falloff + 16px rise); `'fade'` is opacity only; `'scale'` is opacity + scale `0.95 → 1`. |
| `fit` | `'cover' \| 'contain'` | `'cover'` | How the image fits its box. `'cover'` crops to fill; `'contain'` letterboxes. |
| `placement` | `Placement?` | – | Where on the canvas the image sits. Pass a region (`'center'`, `'upper-third'`, …) or `{ x, y, anchor }` in 0..1 canvas fractions. **When omitted, the image fills the entire canvas.** |
| `width` | `number?` | – | Explicit width in px. When omitted, the image fills its container. |
| `height` | `number?` | – | Explicit height in px. When omitted, the image fills its container. |
| `borderRadius` | `number` | `0` | Border radius in px. |

## Usage

```tsx
import { Composition } from 'remotion';
import { ImageReveal, imageRevealSchema } from './components/onda/image-reveal/ImageReveal';

export const Root: React.FC = () => (
  <Composition
    id="HeroImage"
    component={ImageReveal}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
    schema={imageRevealSchema}
    defaultProps={{
      src: '/hero.jpg',
      alt: 'Product hero shot',
      delay: 0,
      duration: 24,
      motion: 'blur',
      fit: 'cover',
      borderRadius: 0,
    }}
  />
);
```

For a placed (sub-canvas) image:

```tsx
<ImageReveal
  src="/portrait.jpg"
  placement="upper-third"
  width={480}
  height={640}
  motion="scale"
  borderRadius={16}
/>
```

## Motion notes

- **Three variants, one spring.** All three motion variants drive progress through `SPRING_SMOOTH` from `lib/motion.ts`. `'fade'` and `'scale'` compose `entryFade` / `entryScale` from `lib/choreography.ts`; `'blur'` inlines the same math as `BlurReveal` (the catalog's reference primitive for that motion — no `entryBlur` helper exists by design, see techspec 005).
- **`'blur'` is the default** because it carries the strongest Onda fingerprint — opacity, blur falloff, and a 16px rise settling together feels unmistakably "Onda" applied to an image. Reach for `'fade'` when you want quieter background reveals; reach for `'scale'` when the image is a focal element entering on a stage.
- **`'scale'` from is 0.95** (not entryScale's default 0.9) — images at 0.9 read as a noticeable "pop" on large compositions. 0.95 keeps the motion subtle, which is what an image-with-typography composition usually wants.
- **No overshoot, ever.** Same restraint rule as every other Onda entrance.
- **All `interpolate` calls clamp at both ends** — the component is correct on frame 0 and on any frame past `delay + duration`.

## Layout notes

- **Default fills the canvas.** When no `placement` is passed, the component renders as an `AbsoluteFill` with the image at `width: 100%`, `height: 100%`, and the chosen `fit`. Matches the existing `KenBurns` / `Parallax` defaults.
- **`placement` switches to sub-canvas positioning.** When set, the image renders inside a `PlacementBox` from `lib/canvas.tsx`. Use `width` / `height` to size the image; without them, the image renders at its intrinsic size (capped at canvas width via PlacementBox's `max-width: 100%`).
- **`fit` always applies** — both in the default fill case and the placed case — so the image's aspect handling is consistent across modes.
