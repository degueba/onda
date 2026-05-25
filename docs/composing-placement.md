# Placement & size

How to position and scale Onda components on the canvas. Part of the [Composing with Onda](/docs/composing-with-onda) reference.

## Placement

Where on the canvas a component sits. **Every renderable component accepts `placement`** — text primitives, motion wrappers, scene blocks, data primitives, media, cinematic. The only exemptions are pure layer effects (`Vignette`, `GrainOverlay`, `GradientShift`) which describe an effect over the whole frame, and `Callout` / `Spotlight` which use their own `x` / `y` vocabulary (see Annotation below).

One vocabulary, two shapes:

```ts
type Placement =
  | PlacementRegion          // ergonomic shorthand
  | PlacementCoords;         // fine control

type PlacementRegion =
  | 'center'                 // canvas center
  | 'top' | 'bottom'         // horizontal midline, with safe margin
  | 'left' | 'right'         // vertical midline, with safe margin
  | 'top-left' | 'top-right'
  | 'bottom-left' | 'bottom-right'
  | 'upper-third'            // y ≈ 0.28, horizontally centered
  | 'lower-third';           // y ≈ 0.72, horizontally centered

type PlacementCoords = {
  x: number;                 // 0..1 fraction of canvas width
  y: number;                 // 0..1 fraction of canvas height
  anchor?: Anchor;           // which point of the component sits at (x, y). Default 'center'.
};

type Anchor =
  | 'center'
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
```

**Coordinates are unclamped.** `x: -0.2`, `y: 1.1` are valid — use them for entrances, exits, and deliberate bleed past the canvas edge.

**Region defaults pick the matching anchor.** `'top-left'` puts the component's top-left corner near the canvas's top-left (10% safe margin). `'center'` centers on the canvas. `'upper-third'` is horizontally centered with `y: 0.28`.

Examples:

```json
{ "component": "TitleCard", "props": { "title": "Hello", "placement": "upper-third" } }
{ "component": "StatCard",  "props": { "value": 1247, "placement": "center" } }
{ "component": "LowerThird","props": { "name": "Rodrigo", "placement": "bottom-right" } }

{ "component": "BlurReveal","props": { "text": "Hi", "placement": { "x": 0.3, "y": 0.7, "anchor": "top-left" } } }
{ "component": "BlurReveal","props": { "text": "Slide", "placement": { "x": 1.1, "y": 0.5 } } }  // off-canvas right
```

## Size

Semantic typography role. Accepted on 13 components. Resolves to pixels via the **smaller canvas dimension**, so the same role lands at the same visual weight on horizontal, vertical, or square compositions.

```ts
type SizeRole =
  | 'hero'        // ~15% of min(width, height) — focal headline, dominant
  | 'heading'     // ~9%  — section headline
  | 'subheading'  // ~5.2% — secondary heading
  | 'body'        // ~3%  — running text
  | 'caption';    // ~2%  — metadata, attribution, fine print
```

**Precedence: `size` wins over `fontSize` when both are passed.** In practice the agent picks one — pass `size: 'heading'` for canvas-aware sizing, or pass `fontSize: 120` for explicit pixels. If neither is passed, the component's premium default applies.

Examples:

```json
{ "component": "BlurReveal", "props": { "text": "Hello", "size": "hero" } }
{ "component": "CountUp",    "props": { "from": 0, "to": 1247, "size": "hero" } }
```

**Scene blocks have per-element size props.** A scene block (e.g., `TitleCard`) composes multiple primitives, each with its own size:

```json
{
  "component": "TitleCard",
  "props": {
    "title": "Onda",
    "subtitle": "premium motion graphics",
    "titleSize": "hero",
    "subtitleSize": "subheading"
  }
}
```

## Annotation (positioning via dedicated coords, not `placement`)

Two components position themselves with their own `x` / `y` vocabulary rather than `placement`, because they point *at* a spot rather than sitting *in* a region.

### `Callout`
Label + arrow pointing at a specific spot on the canvas. Bubble fades + scales in, arrow draws on after a beat.
- Positioning: `x`, `y` (0..1 canvas fractions, the anchor point), `position` (`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` — which quadrant the bubble sits relative to the anchor), `offset` (px from anchor to bubble center).
- Key props: `label`, `x`, `y`, `position`, `offset`, `delay`, `duration`, `lineDelay`, `lineDuration`, `color`, `bgColor`, `borderColor`, `arrowColor`, `arrowWidth`, `fontSize`.
- Reads canvas dimensions from `useVideoConfig()` — no `canvasWidth` / `canvasHeight` props.

### `Spotlight`
Radial light reveal — a soft circle of light grows from 0 to `radius`, centered at (`x`, `y`). Full-canvas alpha-aware gradient.
- Positioning: `x`, `y` (0..1 canvas fractions for the light center), `radius` (% of smaller canvas dimension), `softness` (0–100, % of radius given to the fade tail).
- Key props: `x`, `y`, `radius`, `delay`, `duration`, `color`, `softness`.
- Reads canvas dimensions from `useVideoConfig()` — no `canvasWidth` / `canvasHeight` props.
