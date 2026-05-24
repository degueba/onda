# Techspec 008 — Canvas-aware components

## Problem

A developer or AI agent using Onda to assemble a video hits two predictable walls on the very first composition:

**Wall 1 — sizing doesn't follow the canvas.** `BlurReveal` defaults to `fontSize: 96`. On 1920×1080 that's a confident headline. On 1080×1920 (vertical, common for social), the same value reads small and unconfident. The caller has to do per-canvas math ("vertical, scale font 1.5–2×"). An LLM does this badly, and a human does it tediously.

**Wall 2 — placement is inconsistent across the catalog.** Three classes of component coexist with no unifying contract:

- **Self-positioning** (`Callout`, `Spotlight`) — accept fractional `x` / `y` on canvas. Already canvas-aware (modulo the `canvasWidth` / `canvasHeight` props they shouldn't take — they should read from `useVideoConfig()`).
- **Discrete-position** (`LowerThird`) — accepts a named enum (`'bottom-left' | 'bottom-right'`). Canvas-aware in spirit but with a one-off API.
- **Render-wherever** (`TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`) — wrap themselves in `<AbsoluteFill>` and center. To put one anywhere else, the caller forks the component or wraps it in their own positioned container.

A caller composing two of these into one scene has to know *which class each component falls into* to position them — that's untyped tribal knowledge, the opposite of what Onda's Zod-first contract promises.

`lib/tokens.ts` already exports the visual tokens (`COLOR`, `FONT`). There's no equivalent for canvas-relative geometry — no shared `Placement` type, no canvas-aware size helper, no `PlacementBox` primitive. Every component reinvents its own layout.

## Decision

**Make every component a first-class canvas citizen.** One placement vocabulary, one size vocabulary, one helper file. No multi-component composition primitives (`<Stage>` / `<Beat>` / `<Scene>`) — that's the next layer, and it only makes sense once every atomic component places and sizes itself predictably on a canvas it didn't pick.

**1. Add `lib/canvas.ts` with the shared geometry vocabulary.**

```ts
// lib/canvas.ts (new)

export type Anchor =
  | 'center'
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type PlacementCoords = {
  /** 0..1 fraction of canvas width. */
  x: number;
  /** 0..1 fraction of canvas height. */
  y: number;
  /** Which point of the component sits at (x, y). Default `'center'`. */
  anchor?: Anchor;
};

export type PlacementRegion =
  | 'center'
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'upper-third' | 'lower-third';

/** Pass a region string for ergonomics, or an object for fine control. */
export type Placement = PlacementRegion | PlacementCoords;

export function resolvePlacement(p: Placement | undefined): Required<PlacementCoords>;

/** A canvas-aware placement wrapper. Use as the outer element of any
 *  positionable component. Reads canvas dims from `useVideoConfig()`. */
export const PlacementBox: React.FC<{ placement?: Placement; children: React.ReactNode }>;

export type SizeRole = 'hero' | 'heading' | 'subheading' | 'body' | 'caption';

/** Maps a role to a pixel value via the smaller canvas dimension. */
export function resolveSize(
  role: SizeRole,
  canvas: { width: number; height: number },
): number;
```

Region → coords mapping (anchors chosen so the region intuition matches — `'top-left'` puts the component's top-left corner near the canvas's top-left, not its center):

| Region          | x    | y    | anchor        |
| --------------- | ---- | ---- | ------------- |
| `center`        | 0.5  | 0.5  | `center`      |
| `top`           | 0.5  | 0.15 | `top`         |
| `bottom`        | 0.5  | 0.85 | `bottom`      |
| `left`          | 0.15 | 0.5  | `left`        |
| `right`         | 0.85 | 0.5  | `right`       |
| `top-left`      | 0.1  | 0.1  | `top-left`    |
| `top-right`     | 0.9  | 0.1  | `top-right`   |
| `bottom-left`   | 0.1  | 0.9  | `bottom-left` |
| `bottom-right`  | 0.9  | 0.9  | `bottom-right`|
| `upper-third`   | 0.5  | 0.28 | `center`      |
| `lower-third`   | 0.5  | 0.72 | `center`      |

Anchor → CSS transform (composed on `position: absolute; left: x%; top: y%`):

| Anchor         | transform                       |
| -------------- | ------------------------------- |
| `center`       | `translate(-50%, -50%)`         |
| `top`          | `translate(-50%, 0)`            |
| `bottom`       | `translate(-50%, -100%)`        |
| `left`         | `translate(0, -50%)`            |
| `right`        | `translate(-100%, -50%)`        |
| `top-left`     | `translate(0, 0)`               |
| `top-right`    | `translate(-100%, 0)`           |
| `bottom-left`  | `translate(0, -100%)`           |
| `bottom-right` | `translate(-100%, -100%)`       |

Size role scale (fraction of the smaller canvas dimension):

| Role         | fraction | 1080-dim px |
| ------------ | -------- | ----------- |
| `hero`       | 0.15     | 162         |
| `heading`    | 0.09     | 97          |
| `subheading` | 0.052    | 56          |
| `body`       | 0.03     | 32          |
| `caption`    | 0.02     | 22          |

Calibrated against current defaults so existing `fontSize` numbers map cleanly to the new roles.

**2. Retrofit `placement?: Placement` onto every positionable component.**

The 10 components that today render "wherever":

`TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`, `LowerThird`.

Per-component change: replace the existing `<AbsoluteFill style={{ justifyContent, alignItems }}>` with `<PlacementBox placement={placement}>`. Default behavior preserved when no `placement` is passed (defaults to `'center'`). For `LowerThird`, the existing `position: 'bottom-left' | 'bottom-right'` prop is removed in favor of `placement` (the same two values exist as region shorthands — visually identical defaults).

**Not retrofitted with `placement`:**

- `Callout` — keeps its existing anchor + bubble-quadrant model. Different positioning concept (point to a spot, place bubble nearby), not the same as "place this thing here."
- `Spotlight` — keeps `x` / `y` / `radius`. It's a full-canvas radial effect that happens to have a center point; `placement` doesn't apply.
- Full-canvas effects (`Vignette`, `GrainOverlay`, `KenBurns`, `Parallax`, `GradientShift`, `Marquee`) — concept doesn't apply.
- Motion wrappers (`FadeIn`, `SlideIn`, `ScaleIn`, `FadeOut`, `SlideOut`, `RotateIn`, `StaggerGroup`, `MaskReveal`, `PieReveal`, `DrawOn`, `CameraShake`) — they wrap a child; the child handles its own placement.
- Composites with their own internal layout (`BarChart`, `Timeline`, `ProgressBar`, `Captions`) — they manage layout of their own children; the *composite* could take `placement` but is deferred until usage demands it.

**3. Add `size?: SizeRole` to typography components.**

Same 10 components plus a few more text-heavy primitives where it applies: `TitleCard`, `BlurReveal`, `StatCard`, `QuoteCard`, `CountUp`, `WordStagger`, `Highlight`, `ChapterCard`, `EndCard`, `LowerThird`, `IconPop`, `WordRotate`, `Typewriter`, `Underline`.

`size` is **opt-in**. Existing `fontSize` numeric defaults stay. Passing `size` switches to canvas-aware resolution; passing `fontSize` explicitly always wins. Components with multiple text elements (`TitleCard`'s title + subtitle, `StatCard`'s number + label) accept role-per-element where appropriate (e.g., `titleSize?: SizeRole`, `subtitleSize?: SizeRole`) — same opt-in semantics.

**4. Fix `Callout` and `Spotlight` to drop `canvasWidth` / `canvasHeight`.**

Both already call `useVideoConfig()` for `fps`. They get destructured to `{ fps, width, height }` and use those everywhere the dropped props were referenced. Small breaking change to the prop surface; both components are recent.

**5. Author `docs/composing-with-onda.md`.**

A single, LLM-facing reference page. Structure:

- **Payload shape** — the standard component-call payload (`{ component, props }`) and the canvas envelope (`{ width, height, fps, durationInFrames }`).
- **Placement vocabulary** — the `Placement` type, the region table, the coords form. Worked examples.
- **Size vocabulary** — the `SizeRole` table, the override rules.
- **Component index** — for each component, a one-block entry: name, one-line purpose, whether it takes `placement`, whether it takes `size`, key props with types and defaults.

Written tight (no marketing voice, no rationale). Designed to be loaded verbatim into an agent's context. Hand-authored in v1; deriving from the registry is a later spec.

## Goals

1. Any component renders correctly on any canvas without per-canvas prop math from the caller.
2. A caller can position any positionable component with one prop, using either a named region (ergonomic) or fractional coords (precise) — same vocabulary across the catalog.
3. An LLM can emit valid Onda compositions by reading `docs/composing-with-onda.md` and nothing else.
4. `Callout` and `Spotlight` read canvas dimensions from `useVideoConfig()`.
5. Existing callers see zero behavior change when they don't pass `placement` or `size` (defaults preserved).

## Non-goals

- Multi-component composition primitives (`<Stage>` / `<Beat>` / `<Scene>`). They become the natural follow-up once placement and sizing are first-class.
- Retrofitting motion wrappers (`FadeIn`, `SlideIn`, etc.) with `placement` — child handles position; wrapper handles motion.
- Retrofitting full-canvas effects (`Vignette`, `KenBurns`, etc.) — concept doesn't apply.
- Theming (007 is paused, not killed — see [../007-component-theming-api/design.md](../007-component-theming-api/design.md) for the current pause rationale).
- Renaming any existing prop other than `LowerThird.position` (which folds into `placement`).
- Auto-generating `composing-with-onda.md` from the registry — deferred to a later spec.
- Per-canvas conditional behavior (e.g., "if vertical, use different defaults"). Canvas-aware sizing is the answer; conditionals would be an escape hatch.
- Audio primitives.

## Reasonable calls (challenge any)

- **Region + coords, with region as shorthand.** Coords-only is too low-level for an agent prompt; regions-only is too rigid for precision work. Supporting both costs one `typeof` branch in `resolvePlacement` and gives both audiences what they want.
- **Anchors default to `'center'`.** The most common case for a freely-placed component is "put this at (x, y) and let it center on that point." Regions pick the right anchor for their semantic (`top-left` region uses `top-left` anchor, not `center`) so the visual matches the name.
- **`size` is opt-in; numeric `fontSize` keeps its current default.** Preserves goal #5 (zero behavior change for existing callers). The role scale is calibrated so passing `size: 'heading'` on a 1080-dim canvas lands within 1–2px of the current default.
- **Size scales off the *smaller* canvas dimension.** Width-based scaling would make vertical compositions feel cramped; height-based would make horizontal feel huge. Smaller-dim is the conservative choice and matches typographic intuition ("how tall is the screen").
- **Region map is centralized in `lib/canvas.ts`, not per-component.** Components shouldn't reinvent "where is the upper third." One vocabulary, one source of truth.
- **`LowerThird.position` is removed, not deprecated.** The component is recent and the migration is a one-line API change (`position="bottom-left"` → `placement="bottom-left"`). Carrying both forever rots the API.
- **`Callout` and `Spotlight` don't get `placement`.** Their existing positioning models are intentionally different (anchor + bubble for Callout; radial center for Spotlight). Forcing them into the `placement` mold would be worse for both APIs.
- **`Placement` coordinates accept any real number, not just `0..1`.** Off-canvas placements are first-class: a component entering from the right starts at `x: 1.1`, exiting up ends at `y: -0.2`, a tilted card can sit at `x: -0.05` for a deliberate bleed. The `0..1` framing in docs is the *common range*, not a constraint. No `.min(0).max(1)` Zod validation on placement coords.

## Open questions deferred

- **Should size roles be per-component tunable** (e.g., `TitleCard.heading` ≠ `CountUp.heading`)? Defer — ship one scale across the catalog and find out whether the same role wants different pixels in different components.
- **A `padding?: number | { x, y }` prop on `PlacementBox`** for components that need to respect the canvas safe margin (CLAUDE.md §2 specifies ~10% per edge)? Defer — let `placement` regions encode the margin choices (`'top'` already includes a 15% top margin via its `y: 0.15`).
- **Should `composing-with-onda.md` ship a JSON manifest alongside the Markdown** so tooling can consume the component index without parsing prose? Probably yes, but defer to the next iteration once the doc's shape settles.
- **Standardizing `Callout` / `Spotlight` onto a unified canvas-positioning API.** Long-term tempting; near-term it would break their model and offer no concrete payoff. Revisit after 2–3 more canvas-positioned components ship and a pattern emerges.
