# Composing with Onda

Single reference for emitting valid Onda component payloads. Written for AI agents and brief-driven runtimes — the human-facing component pages live under [/components](https://onda.video/components) and per-component READMEs.

Load this page (or a near-verbatim slice of it) into agent context when generating Onda compositions.

---

## Payload shape

Standard call form:

```ts
type Payload = {
  component: string;              // PascalCase Onda component name
  props: Record<string, unknown>; // validated against the component's Zod schema
};
```

The canvas envelope (composition-level, set by the caller):

```ts
type CanvasEnvelope = {
  width: number;            // px, e.g. 1920 (horizontal), 1080 (vertical), 1080 (square)
  height: number;           // px
  fps: number;              // typically 30
  durationInFrames: number; // composition length
};
```

Every Onda component is a pure function of `useCurrentFrame()` and `useVideoConfig()` — frame N is deterministic given the props and the canvas. The agent's job is to pick the right component, fill the props, and let Remotion render.

Compose multiple components in one scene by wrapping them in `<AbsoluteFill>` and giving each a `placement` (see below).

---

## Placement

Where on the canvas a component sits. Accepted on 10 components today (see the index). One vocabulary, two shapes:

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

---

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

---

## Component index

Per component: one-line purpose, whether it accepts `placement` and `size` (or per-element size props), and the key props an agent needs to emit a valid payload. Full schemas live in each component's README.

### Typography primitives

#### `BlurReveal`
Canonical text reveal — opacity + blur + 16px rise on `SPRING_SMOOTH`, no overshoot.
- `placement`: yes · `size`: yes
- Key props: `text` (string), `delay` (frames), `duration` (frames), `color`, `fontSize` | `size`, `fontFamily`.

#### `CountUp`
Animated number from `from` to `to` with locale grouping and tabular-nums.
- `placement`: yes · `size`: yes
- Key props: `from`, `to`, `prefix`, `suffix`, `decimals`, `delay`, `duration`, `color`, `fontSize` | `size`.

#### `WordStagger`
Multi-word phrase where each word fades and rises in sequence (4-frame canonical stagger).
- `placement`: yes · `size`: yes
- Key props: `text` (string), `delay`, `duration`, `stagger` (frames), `justify` (`'flex-start' | 'center' | 'flex-end'`), `color`, `fontSize` | `size`.

#### `Highlight`
Marker-style text: text fades in, then an accent-rose bar sweeps in behind it. Reserved for emphasis.
- `placement`: yes · `size`: yes
- Key props: `text`, `delay`, `duration`, `lineDelay`, `lineDuration`, `color`, `accentColor`, `fontSize` | `size`, `paddingX`.

#### `WordRotate`
Cycles through phrases in place — each rises in, holds, fades out as the next arrives.
- `placement`: no · `size`: yes
- Key props: `phrases` (string[]), `delay`, `holdDuration` (frames), `transitionDuration` (frames), `color`, `fontSize` | `size`.

#### `Typewriter`
Character-by-character text reveal with optional blinking cursor. **Linear** by design (typing needs constant rate).
- `placement`: no · `size`: yes
- Key props: `text`, `delay`, `duration`, `cursor` (boolean), `cursorColor`, `color`, `fontSize` | `size`. Defaults to Space Grotesk (body font) — reads more "terminal" than Clash.

#### `Underline`
Text fades in, then an accent-rose underline draws beneath. Two-phase emphasis primitive.
- `placement`: no · `size`: yes
- Key props: `text`, `delay`, `duration`, `lineDelay`, `lineDuration`, `color`, `accentColor`, `lineThickness`, `lineOffset`, `fontSize` | `size`.

### Scene blocks (compose multiple primitives)

#### `TitleCard`
Hero title-card: large headline rises with blur-reveal, subtitle cascades word-by-word, optional accent underline.
- `placement`: yes · `size`: per-element (`titleSize`, `subtitleSize`)
- Key props: `title`, `subtitle`, `delay`, `accent` (boolean), `titleFontSize` | `titleSize`, `subtitleFontSize` | `subtitleSize`, `color`, `subtitleColor`, `accentColor`.

#### `StatCard`
Big counted-up number above a word-staggered label above an accent rule. The "Onda data look."
- `placement`: yes · `size`: per-element (`numberSize`, `labelSize`)
- Key props: `value` (number), `label`, `prefix`, `suffix`, `delay`, `accent`, `numberFontSize` | `numberSize`, `labelFontSize` | `labelSize`, `color`, `labelColor`, `accentColor`.

#### `QuoteCard`
Centered pull-quote with attribution and an accent divider. Quote staggers in slowly (reads, not cascades), then divider, then author + role.
- `placement`: yes · `size`: per-element (`quoteSize`, `authorSize`)
- Key props: `quote`, `author`, `role`, `delay`, `accent`, `quoteFontSize` | `quoteSize`, `authorFontSize` | `authorSize`, `color`, `authorColor`, `accentColor`.

#### `ChapterCard`
Numbered eyebrow ("01") above a chapter title with optional accent underline. Documentary / explainer chapter break.
- `placement`: yes · `size`: per-element (`numberSize`, `titleSize`)
- Key props: `chapter`, `number` (string), `delay`, `accent`, `numberFontSize` | `numberSize`, `titleFontSize` | `titleSize`, `color`, `numberColor`, `subtitleColor`.

#### `EndCard`
Closing scene: hero CTA with optional accent underline, then a staggered row of social handles or URLs.
- `placement`: yes · `size`: per-element (`ctaSize`, `handlesSize`)
- Key props: `cta`, `handles` (string[]), `delay`, `accent`, `ctaFontSize` | `ctaSize`, `handlesFontSize` | `handlesSize`, `color`, `handlesColor`, `accentColor`.

#### `LowerThird`
Broadcast-style name + role bar that slides in from a corner with an accent underline. Slide direction and inner alignment derive from `placement`.
- `placement`: yes · `size`: per-element (`nameSize`, `roleSize`)
- Key props: `name`, `role`, `delay`, `accent`, `placement` (default `'bottom-left'`), `fontSize` | `nameSize`, `roleFontSize` | `roleSize`, `color`, `roleColor`, `accentColor`.

### Annotation (positioning via dedicated coords, not `placement`)

#### `Callout`
Label + arrow pointing at a specific spot on the canvas. Bubble fades + scales in, arrow draws on after a beat.
- Positioning: `x`, `y` (0..1 canvas fractions, the anchor point), `position` (`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` — which quadrant the bubble sits relative to the anchor), `offset` (px from anchor to bubble center).
- Key props: `label`, `x`, `y`, `position`, `offset`, `delay`, `duration`, `lineDelay`, `lineDuration`, `color`, `bgColor`, `borderColor`, `arrowColor`, `arrowWidth`, `fontSize`.
- Reads canvas dimensions from `useVideoConfig()` — no `canvasWidth` / `canvasHeight` props.

#### `Spotlight`
Radial light reveal — a soft circle of light grows from 0 to `radius`, centered at (`x`, `y`). Full-canvas alpha-aware gradient.
- Positioning: `x`, `y` (0..1 canvas fractions for the light center), `radius` (% of smaller canvas dimension), `softness` (0–100, % of radius given to the fade tail).
- Key props: `x`, `y`, `radius`, `delay`, `duration`, `color`, `softness`.
- Reads canvas dimensions from `useVideoConfig()` — no `canvasWidth` / `canvasHeight` props.

### Other component categories

Components below don't accept `placement` or `size` for principled reasons. Use them for what they do; let other components handle layout and typography.

**Motion wrappers** — apply motion to a child component or text. The child handles its own placement and sizing.
`FadeIn`, `SlideIn`, `ScaleIn`, `FadeOut`, `SlideOut`, `RotateIn`, `StaggerGroup`, `MaskReveal`, `PieReveal`, `DrawOn`, `CameraShake`.

**Full-canvas effects** — render across the entire canvas; "placement" doesn't apply.
`Vignette`, `GrainOverlay`, `KenBurns`, `Parallax`, `GradientShift`, `Marquee`.

**Composites with internal layout** — manage their own children's layout. Could grow `placement` if needed; not retrofitted yet.
`BarChart`, `Timeline`, `ProgressBar`, `Captions`.

**Icons** — `IconPop` has its own pixel `size` prop (square SVG dimension). The semantic `SizeRole` doesn't apply directly; an icon-specific size scale is on the roadmap.

**Brand/identity** — `LogoSting` is the Onda mark animation; no positioning customization.

---

## Determinism rules (always)

- All Onda components are pure functions of `useCurrentFrame()` and `useVideoConfig()`. Same payload + same frame = same pixels.
- Never pass `Date.now()`, `Math.random()`, or other non-deterministic values in props. Use seed-based variation if you need randomness (some components accept a `seed` prop).
- Wrap timed sections in `<Sequence from={...} durationInFrames={...}>`. Components respect parent `<Sequence>` remapping — their internal `useCurrentFrame()` reads relative to the sequence start.

---

## Multi-component scenes

To compose multiple components in one scene, the caller wraps them in `<AbsoluteFill>`:

```tsx
<AbsoluteFill>
  <TitleCard title="Stats that matter" placement="top" />
  <StatCard value={1247} label="creators this week" placement="center" />
  <LowerThird name="Rodrigo" placement="bottom-right" />
</AbsoluteFill>
```

Each component handles its own placement; they don't compete for layout. Sequence beats with `<Sequence>` when you want one component to enter after another:

```tsx
<AbsoluteFill>
  <Sequence from={0} durationInFrames={60}>
    <TitleCard title="Setup" placement="center" />
  </Sequence>
  <Sequence from={60} durationInFrames={90}>
    <StatCard value={1247} placement="center" />
  </Sequence>
</AbsoluteFill>
```
