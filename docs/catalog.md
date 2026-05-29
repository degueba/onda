# What's in Onda

> The breadth of the library at a glance. Browse and **try every component interactively** at [/components](/components); see them composed into full videos at [/showcase](/showcase). This page is the map.

Onda is **70 components + 18 transitions**, built on a shared foundation. Everything is deterministic (a pure function of the current frame — no `Math.random()`/`Date` in render), Zod-typed, premium by default, and carries one motion identity.

## Components by category

- **Entrances (15)** — reveal a single element as it enters. `blur-reveal` (the reference primitive), `fade-in`, `slide-in`, `scale-in`, `rotate-in`, `mask-reveal`, `word-stagger`, `word-rotate`, `typewriter`, `tracking-in`, `matrix-decode`, `slot-machine-roll`, `stagger-group`, `fade-out`, `slide-out`.
- **Interface (15)** — developer & product UI surfaces. `code-block`, `terminal`, `browser-frame`, `device-frame`, `cursor`, `code-diff`, `progress-steps`, `pulsing-indicator`, `kanban-board`, `pricing-card`, `bento-grid`, `split-screen`, `input-field`, `skeleton-card`, `button`.
- **Graphics (12)** — emphasis and treatment on content. `highlight`, `underline`, `shimmer-sweep`, `text-fade-replace`, `rgb-glitch-text`, `spotlight-card`, `draw-on`, `callout`, `icon-pop`, `node-graph`, `confetti`, `bounding-box`.
- **Data (7)** — animated numbers & charts. `count-up`, `bar-chart`, `line-chart`, `pie-reveal`, `progress-bar`, `timeline`, `captions`.
- **Scenes (7)** — composite scene blocks. `title-card`, `stat-card`, `quote-card`, `chapter-card`, `end-card`, `lower-third`, `logo-sting`.
- **Atmosphere (5)** — full-canvas backgrounds & texture. `mesh-gradient`, `dynamic-grid`, `gradient-shift`, `grain-overlay`, `vignette`.
- **Cinematic (5)** — camera-feel moves. `ken-burns`, `parallax`, `camera-shake`, `spotlight`, `marquee`.
- **Media (4)** — audio & video. `video-clip`, `image-reveal`, `audio-clip`, `audio-visualizer`.

→ The full, filterable list with live previews lives at [/components](/components).

## Transitions

18 scene-to-scene cuts for `<TransitionSeries>`, all baking in the house timing so cuts feel like the scenes:

- **Calm:** `crossFade` · `morph` · `dipToColor` · `blur`
- **Geometric:** `wipe` · `clockWipe` · `iris` · `flip` · `expandMorph`
- **Spatial:** `slide` · `push` · `depthPush` · `devicePullback`
- **Accent / high-energy:** `zoom` · `chromaticAberration` · `gridPixelate` · `glassWipe` · `typeMask`

Usage and the full pattern: [Timeline & transitions](/docs/composing-timeline). See them in motion in the [dev-demo showcase](/showcase/dev-demo).

## Foundation

Components are built on a small shared layer you also install (it comes along automatically via the CLI):

- **Tokens** — `COLOR`, `FONT`, `SPACING`, plus surface polish (`RADIUS`, `SHADOW`, `GLOW`, `BLUR`). The default design system — surface is brand-overridable.
- **Motion** — `DURATION`, `STAGGER`, `SPRING_SMOOTH` / `SPRING_SNAPPY`, `HOUSE_EASE`, and `seededRandom` for deterministic randomness.
- **Hooks** — `useEntrance`, `useStaggeredEntrance`, `useSpringValue`, `useSceneProgress`, `useTextReveal`.
- **Primitives** — `Surface` (card / glass), `Glow`, `GridField` — the building blocks the surface-heavy components compose.

## Install

```bash
npx ondajs add <name>
```

Source is copied into your project (never a black-box dependency), and any foundation modules a component needs are pulled in automatically. Own it, edit it.
