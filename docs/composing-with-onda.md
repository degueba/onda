# Composing with Onda

Single reference for emitting valid Onda component payloads. Written for AI agents and brief-driven runtimes — the human-facing component pages live under [/components](https://onda.video/components) and per-component READMEs.

Load this page (or a near-verbatim slice of it) into agent context when generating Onda compositions.

---

## Payload shape

Two recommended shapes — pick based on whether the scene has one component or many.

### Single-component payload

```ts
type Payload = {
  component: string;              // PascalCase Onda component name
  props: Record<string, unknown>; // validated against the component's Zod schema
};
```

### Timeline-shape payload (recommended for multi-component scenes)

```ts
type Composition = {
  fps: number;                    // typically 30
  width: number;                  // px, e.g. 1920 (horizontal), 1080 (vertical)
  height: number;                 // px
  tracks: Track[];                // parallel layers, rendered in order
};

type Track = {
  id?: string;
  entries: Entry[];               // sequential beats within this track
};

type Entry = {
  at: string | number;            // when this beat starts — "0:04" | "30s" | 4 (seconds) | 90 (raw seconds when number)
  for: string | number;           // duration — same time spec as `at`
  component: string;              // PascalCase Onda component name
  props: Record<string, unknown>;
};
```

The canvas envelope sits at the composition root (`fps` / `width` / `height`); each track is a parallel layer (think After Effects layers), and each entry is a beat on that track with explicit start time and duration. Beats within a track are sequential; tracks overlap in time.

Every Onda component is a pure function of `useCurrentFrame()` and `useVideoConfig()` — frame N is deterministic given the props and the canvas. The agent's job is to pick the right components, fill the props, and let Remotion render.

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

### Media (consume external `src` URLs)

These components render user-uploaded or hosted media. `src` is passed through verbatim — Onda doesn't host; the caller provides whatever URL their asset store serves.

**Critical rule for agents:** when you need to render a user-supplied photo or video clip, **always reach for `ImageReveal` or `VideoClip` first**. Bare `<Img>` / `<OffthreadVideo>` work, but they don't carry the Onda motion identity — a scene that uses them sits visually outside the rest of the composition. `KenBurns` and `Parallax` exist for *specific sustained motions* (continuous zoom-pan / drift), not for general-purpose photo or video display.

#### Picking the right media component

| If you want… | Use | Don't use |
| --- | --- | --- |
| Show a photo with an Onda entrance, then hold it | **`ImageReveal`** (any `motion` variant) | `KenBurns` (forces zoom-pan), `Parallax` (forces drift), bare `<Img>` (no fingerprint) |
| Show a photo with continuous slow zoom-and-pan (documentary feel) | **`KenBurns`** | `ImageReveal` (no sustained motion) |
| Show a photo with continuous linear drift (no zoom) | **`Parallax`** | `ImageReveal`, `KenBurns` |
| Play a trimmed video clip with Onda fade-in/out | **`VideoClip`** | Bare `<OffthreadVideo>` (no fingerprint, manual frame math) |
| Loop a video as a background plate | **`VideoClip`** with `loop`, `muted`, `fade={false}` | Bare `<OffthreadVideo loop>` |
| Crossfade between two video beats | **`VideoClip`** inside `<TransitionSeries>` with `fade={false}` per clip | `VideoClip` with default fade (would double-fade against the transition) |

The categories are complementary, not redundant: `ImageReveal` owns *entrances*, `KenBurns` / `Parallax` own *sustained motion across a held image*. Forcing the wrong one is the most common mistake — Ken Burns-ing every photo because it's the only image component the agent remembered makes every scene feel like a documentary slideshow.

#### `ImageReveal`
An image that enters with one of Onda's signature motion fingerprints — `'blur'` (BlurReveal's fingerprint applied to images), `'fade'` (opacity only), or `'scale'` (subtle 0.95 → 1, no overshoot). All variants drive on `SPRING_SMOOTH`. After the entrance, the image holds static — no continuous motion.
- `placement`: yes (defaults to canvas-fill — pass `placement` to position as a sub-canvas element) · `size`: n/a (use `width` / `height` for dimensions in px)
- Key props: `src`, `alt`, `delay`, `duration`, `motion` (`'blur' | 'fade' | 'scale'`), `fit` (`'cover' | 'contain'`), `placement`, `width`, `height`, `borderRadius`.
- **Default `motion: 'blur'`** carries the strongest Onda fingerprint. Use `'fade'` for quieter background reveals; use `'scale'` when the image is a focal element entering on a stage.

#### `VideoClip`
A video clip with agent-friendly trim, Onda's entrance/exit fade fingerprint, and optional looping. Wraps Remotion's `<OffthreadVideo>` (preferred over `<Video>` for non-realtime renders — better seek accuracy, no audio drift). `startAt` / `endAt` accept the time-string vocabulary (`"0:04"`, `"30s"`, `"500ms"`, raw seconds), resolved internally via `toFrames()` — agents never compute frames.
- `placement`: yes (defaults to canvas-fill) · `size`: n/a (use `width` / `height` for dimensions in px)
- Key props: `src`, `delay`, `startAt`, `endAt`, `fade` (boolean), `fadeDuration`, `muted`, `volume`, `loop`, `fit`, `placement`, `width`, `height`, `borderRadius`.
- **`loop` requires `endAt`** (the loop interval is `endAt - startAt`).
- **Loop disables fade-out** — there's no defined end to fade against. For a fading-out looping background, wrap in `<TransitionSeries>` or a parent opacity envelope.
- **Inside `<TransitionSeries>`, set `fade={false}`** so the transition primitive owns the crossfade instead of double-fading.

#### `KenBurns`, `Parallax`
Pre-existing specialized image-with-motion components. **Their job is sustained motion, not entrance** — the photo is present from frame 0 (no fade-in), then the "camera" moves continuously and linearly.
- `KenBurns` — slow zoom + pan over a photo, default 1.0 → 1.1 scale over ~5s. The iconic documentary motion. Intentionally linear (springs at this scale read as camera acceleration).
- `Parallax` — steady horizontal or vertical drift (no zoom). A lighter, no-zoom complement for backgrounds and b-roll.
- Reach for these *only* when the user/agent explicitly wants the named effect. If the prompt is "show this photo," use `ImageReveal`, not `KenBurns`.

#### What these media components don't do

Agents should NOT expect these primitives to:
- **Render audio.** No audio primitives exist yet — uploaded audio assets can't be rendered with an Onda visualization (separate spec when audio support lands).
- **Compose media + caption automatically.** No `MediaCard` exists; compose `ImageReveal` + `WordStagger` / `FadeIn` manually if a caption is needed.
- **Manage uploads, storage, signed URLs, or expiry.** `src` is a verbatim URL — the caller handles the asset's lifecycle.
- **Apply sustained motion (zoom, pan, drift) over an `ImageReveal`.** Use `KenBurns` or `Parallax` for that. (A future spec may refactor those into wrappers that compose with `ImageReveal` for "image enters AND camera drifts" — not shipped yet.)
- **Provide a placeholder while the asset loads.** Caller's concern.

### Media composition pattern

A scene with a background photo (Ken Burns drift) and a foreground video clip sequenced over it:

```tsx
import { Series, AbsoluteFill } from 'remotion';
import { toFrames } from '@/lib/timing';

<AbsoluteFill>
  {/* Background — KenBurns owns the sustained zoom-pan. Photo is present from frame 0. */}
  <KenBurns src="/backdrop.jpg" toScale={1.08} />

  {/* Foreground — each beat enters with the Onda fingerprint (ImageReveal / VideoClip) */}
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <ImageReveal src="/intro.jpg" motion="blur" placement="center" width={720} height={480} borderRadius={12} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:05', fps)}>
      <VideoClip src="/feature.mp4" startAt="0:02" endAt="0:07" placement="center" width={720} height={480} borderRadius={12} />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

Notice the split: `KenBurns` is the *background plate* (sustained motion, held throughout); `ImageReveal` and `VideoClip` are the *foreground beats* (each enters with the Onda fingerprint and gives way to the next).

The placement pattern: media that should fill the canvas (background plates, hero photos) is dropped in **without** `placement`; media that should be inset (cards, picture-in-picture, foreground beats) gets `placement` plus explicit `width` / `height`.

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

## Timeline composition — use Remotion's primitives

Onda doesn't ship its own scene / track / beat primitives. Remotion's existing primitives cover every composition pattern an agent needs; Onda's value-add is the *components* on top, not the rendering substrate.

Use these Remotion primitives directly:

| Pattern | Remotion primitive |
| --- | --- |
| Composition root | `<Composition>` (set fps / width / height / durationInFrames) |
| Time-slice a child | `<Sequence from={frames} durationInFrames={frames}>` |
| Sequential children without manual frame math | `<Series>` + `<Series.Sequence durationInFrames={frames}>` |
| Sequential children **with crossfades** | `<TransitionSeries>` from `@remotion/transitions` |
| Parallel layers | Multiple children of `<AbsoluteFill>` |
| Repeat children | `<Loop>` |
| Freeze a child at a specific frame | `<Freeze frame={n}>` |
| Image media | `<Img src={url}>` |
| Video media | `<OffthreadVideo src={url}>` (preferred) or `<Video>` |
| Audio media | `<Audio src={url}>` |

For agent-friendly time specs, use Onda's one timing helper: `toFrames(spec, fps)` from `lib/timing.ts`. Accepts `"M:SS"`, `"Ns"`, `"Nms"`, `"Nf"`, or a raw seconds number.

### Single-track sequential scene

A title lands, then a stat, then a lower-third — one after another on a single track:

```tsx
import { Series, AbsoluteFill } from 'remotion';
import { toFrames } from '@/lib/timing';

// composition-level: fps is set on the parent <Composition>
const { fps } = useVideoConfig();

<AbsoluteFill>
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <TitleCard title="Setup" placement="center" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <StatCard value={1247} label="creators this week" placement="center" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <LowerThird name="Rodrigo" placement="bottom-right" />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

### Multi-track overlapping scene

A persistent gradient background while typography beats pass over it — two parallel tracks:

```tsx
<AbsoluteFill>
  {/* Track 1: persistent background */}
  <GradientShift from="#0E0E12" to="#1C1C22" />

  {/* Track 2: sequential typography over it */}
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:02', fps)}>
      <TitleCard title="Setup" placement="upper-third" />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <StatCard value={1247} placement="center" />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

### Sequential beats with crossfades

When the agent wants soft transitions between beats instead of hard cuts, use `<TransitionSeries>` from `@remotion/transitions` (separate Remotion package; install via `npm i @remotion/transitions`):

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={toFrames('0:02', fps)}>
    <TitleCard title="Setup" placement="center" />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: toFrames('0:00.5', fps) })} />
  <TransitionSeries.Sequence durationInFrames={toFrames('0:03', fps)}>
    <StatCard value={1247} placement="center" />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Mapping a timeline payload to JSX — use the shipped `<CompositionRenderer>`

The lib ships the canonical translator: import `<CompositionRenderer>` and pass your composition payload + a component registry. No need to hand-write the renderer.

```tsx
import { CompositionRenderer, compositionSchema, type Composition, type ComponentRegistry } from '@ondajs/lib';

// Per-consumer registry: bundle only what you've installed via `bunx ondajs add`.
import { BlurReveal, blurRevealSchema } from './components/onda/blur-reveal/BlurReveal';
import { TitleCard,  titleCardSchema  } from './components/onda/title-card/TitleCard';
import { StatCard,   statCardSchema   } from './components/onda/stat-card/StatCard';

const ondaRegistry: ComponentRegistry = {
  BlurReveal: { component: BlurReveal, schema: blurRevealSchema },
  TitleCard:  { component: TitleCard,  schema: titleCardSchema  },
  StatCard:   { component: StatCard,   schema: statCardSchema   },
};

const payload: Composition = {
  fps: 30, width: 1080, height: 1920,
  tracks: [
    { entries: [
      { at: '0:00', for: '0:02', component: 'TitleCard', props: { title: 'Hello' } },
      { at: '0:02', for: '0:03', component: 'StatCard',  props: { value: 1247 } },
    ]},
  ],
};

<Composition
  id="GeneratedScene"
  component={CompositionRenderer}
  durationInFrames={150}
  fps={payload.fps}
  width={payload.width}
  height={payload.height}
  defaultProps={{ composition: payload, registry: ondaRegistry }}
/>
```

What `<CompositionRenderer>` does for you:

1. Validates the composition via `compositionSchema.safeParse()`. A malformed payload renders a visible error placeholder at the canvas level — not a silent crash.
2. For each track, renders an `<AbsoluteFill>` (parallel layering — first track behind, last on top).
3. For each entry, wraps in `<Sequence from={toFrames(at, fps)} durationInFrames={toFrames(for, fps)}>` so time strings (`"0:04"`, `"30s"`) resolve to frames automatically.
4. Looks up `entry.component` in `registry`. Unknown name → entry-level error placeholder ("⚠ Unknown component: 'Foo'").
5. Validates `entry.props` against the looked-up component's Zod schema. Invalid → entry-level error placeholder with the validation message.

Per-entry errors don't crash the whole composition — only that entry's slot shows the placeholder. Agents see exactly what's wrong, where.

**If you're using `bunx ondajs add`**, the CLI maintains a `components/onda/index.ts` barrel for you:

```tsx
// Auto-generated by the CLI — just import and pass:
import { ondaRegistry } from './components/onda';

<Composition component={CompositionRenderer} defaultProps={{ composition: payload, registry: ondaRegistry }} ... />
```

Pass `--no-barrel` to opt out (e.g., if you maintain a hand-curated registry).

### Want to write your own renderer?

If you need behavior the shipped `<CompositionRenderer>` doesn't cover (custom transitions between beats, conditional rendering, etc.), the underlying pattern is:

```tsx
function renderEntry(entry: Entry, fps: number, registry: ComponentRegistry) {
  const Component = registry[entry.component].component;
  return (
    <Sequence
      key={entry.id ?? entry.at}
      from={toFrames(entry.at, fps)}
      durationInFrames={toFrames(entry.for, fps)}
    >
      <Component {...entry.props} />
    </Sequence>
  );
}
```

Each track is its own `<AbsoluteFill>` (parallel layering); each entry within a track becomes a `<Sequence>` shifted to its `at` time. Same vocabulary `<CompositionRenderer>` uses internally — Remotion's primitives plus `toFrames`.

---

## Agent contract helpers

Three small lib exports for agent runtimes — JSON Schema for structured-output APIs, named canvas-dimension constants, and a registry summarizer that builds a system-prompt section from your installed components.

### `compositionJsonSchema` + `entryJsonSchema`

Drop-in JSON Schema versions of the Composition and Entry payloads. Use them with OpenAI structured output, Anthropic tool use, or any LLM call that consumes JSON Schema. The schema stays canonical — change `compositionSchema` (Zod), the JSON Schema updates on next import.

```bash
npx ondajs add lib-composition-json-schema
```

```ts
import { compositionJsonSchema } from './lib/onda/composition-json-schema';

// OpenAI structured output
const response = await openai.responses.create({
  model: 'gpt-5',
  input: prompt,
  text: { format: { type: 'json_schema', name: 'Composition', schema: compositionJsonSchema } },
});

// Anthropic tool use
const response = await anthropic.messages.create({
  model: 'claude-opus-4-7',
  tools: [{
    name: 'emit_composition',
    description: 'Emit an Onda composition payload',
    input_schema: compositionJsonSchema,
  }],
  messages: [{ role: 'user', content: prompt }],
});
```

Pulls `lib-composition` and requires `zod-to-json-schema` as a peer dep (the CLI prints the install line).

### `CANVAS_PRESETS` + `resolveCanvas`

Typed constants for the common video formats — no more hardcoded `1080×1920` in your renderer.

```bash
npx ondajs add lib-canvas-presets
```

```ts
import { CANVAS_PRESETS, resolveCanvas, type CanvasPreset } from './lib/onda/canvas-presets';

CANVAS_PRESETS.verticalSocial    // { width: 1080, height: 1920, fps: 30 }
CANVAS_PRESETS.horizontalSocial  // { width: 1920, height: 1080, fps: 30 }
CANVAS_PRESETS.square            // { width: 1080, height: 1080, fps: 30 }
CANVAS_PRESETS.portraitFeed      // { width: 1080, height: 1350, fps: 30 }
CANVAS_PRESETS.cinematic4k       // { width: 3840, height: 2160, fps: 24 }

// resolveCanvas accepts either a preset name OR explicit dims
resolveCanvas('verticalSocial')                       // { width: 1080, height: 1920, fps: 30 }
resolveCanvas({ width: 1440, height: 900 })           // { width: 1440, height: 900, fps: 30 } (fps defaults to 30)
resolveCanvas({ width: 1440, height: 900, fps: 60 }) // explicit fps
```

When the agent picks a format from a UI, normalize via `resolveCanvas`; when it custom-sizes, same call.

### `summarizeRegistry` + `summarizeRegistryAsMarkdown`

Walks your `ComponentRegistry` and produces either structured component metadata (your choice of format) or pre-formatted markdown (drop straight into a system prompt).

```bash
npx ondajs add lib-registry-summary
```

```ts
import { summarizeRegistry, summarizeRegistryAsMarkdown } from './lib/onda/registry-summary';
import { ondaRegistry } from './components/onda';

// Structured form — for custom formatting
const summary = summarizeRegistry(ondaRegistry);
// summary.components[0] = { name, description, supportsPlacement, supportsSize, keyProps: [...] }

// Markdown form — for system prompts
const promptSection = summarizeRegistryAsMarkdown(ondaRegistry);
// Each component as a markdown section with description + a prop table
```

Pulls `lib-composition-renderer` (for the `ComponentRegistry` type) which transitively pulls `lib-composition` and `lib-timing`. Requires `zod-to-json-schema` as a peer dep (used to introspect Zod prop shapes via stable JSON Schema rather than walking Zod internals).

### Composed — agent runtime startup

The three helpers chain naturally during an agent runtime's initialization:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { compositionJsonSchema } from './lib/onda/composition-json-schema';
import { resolveCanvas, type CanvasPreset } from './lib/onda/canvas-presets';
import { summarizeRegistryAsMarkdown } from './lib/onda/registry-summary';
import { ondaRegistry } from './components/onda';

const SYSTEM_PROMPT = `
You compose Onda motion-graphics scenes. Emit a Composition payload using the emit_composition tool.

Available components:
${summarizeRegistryAsMarkdown(ondaRegistry)}
`;

async function generateComposition(userPrompt: string, format: CanvasPreset = 'verticalSocial') {
  const canvas = resolveCanvas(format);
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    system: SYSTEM_PROMPT,
    tools: [{
      name: 'emit_composition',
      description: 'Emit an Onda composition payload',
      input_schema: compositionJsonSchema as any,
    }],
    messages: [{ role: 'user', content: `${userPrompt}\n\nCanvas: ${canvas.width}×${canvas.height} @ ${canvas.fps}fps.` }],
  });
  // ... extract the tool_use payload, render via <CompositionRenderer>
}
```

Schema validation is the contract; canvas dims are typed constants; the system prompt auto-updates as you install more components. No hand-maintained system-prompt strings, no per-format hardcoded dims, no manual Zod → JSON Schema conversion.
