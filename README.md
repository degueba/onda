<div align="center">

<!-- The animated mark renders inline on GitHub — the SMIL gradient drift
     plays in the README hero. For dark/light awareness GitHub doesn't
     auto-switch SVGs, so we ship the dark-canvas version that reads on
     both surfaces (rose accent works against either). -->
<img src="assets/onda-mark-animated.svg" alt="Onda" width="240" />

# Onda

### Premium motion graphics components for [Remotion](https://remotion.dev).
**Installed as source. Owned by you.**

[![License](https://img.shields.io/badge/License-MIT-D96B82?style=flat-square)](LICENSE)
[![Components](https://img.shields.io/badge/Components-38-D96B82?style=flat-square)](https://onda.video/components)
[![Remotion](https://img.shields.io/badge/Remotion-4.x-D96B82?style=flat-square)](https://remotion.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-D96B82?style=flat-square)](https://www.typescriptlang.org/)

[**Browse the catalog →**](https://onda.video/components) &nbsp;·&nbsp; [**Getting started →**](https://onda.video/docs)

</div>

---

```bash
npx ondajs add fade-in
```

> [!NOTE]
> Onda components are **source you own**, not a black-box dependency. The CLI drops the component's `.tsx` + Zod schema + README into your project. From that moment on, the code is yours to read, edit, and version.

## Why Onda

Onda's edge is a **signature motion identity** — a recognizable way everything moves, applied across a clean set of components. Think Apple, Linear, or Stripe motion: identifiable by feel before any logo appears. Uniqueness lives in *how it moves*, not *what it is*.

Every primitive shares:

- 🎬 **One motion language.** A small set of springs, durations, and stagger values that the whole catalog uses. No bespoke easings sprinkled across components.
- 🎯 **Restraint by default.** Calm reveals, no overshoot, one focal moment per scene. Looks premium with zero configuration.
- 📦 **Source you own.** No runtime dependency on Onda. The CLI copies files into your repo; you keep them.
- ⚙️ **Type-safe and validated.** Every component ships a Zod schema and inferred TypeScript props. Defaults are validated; the schema is the API.

## Quick start

Three steps to a rendering Onda composition. Full walkthrough in the [getting started guide](https://onda.video/docs).

**1.** Have a Remotion project — or scaffold one:

```bash
npx create-video@latest my-video
```

**2.** Add a component from the Onda catalog:

```bash
npx ondajs add fade-in
```

**3.** Use it in your `<Composition>`:

```tsx
import { Composition } from 'remotion';
import { FadeIn, fadeInSchema } from './components/onda/fade-in/FadeIn';

export const Root: React.FC = () => (
  <Composition
    id="MyFade"
    component={FadeIn}
    durationInFrames={60}
    fps={30}
    width={1080}
    height={1920}
    schema={fadeInSchema}
    defaultProps={{ text: 'Hello' }}
  />
);
```

> [!TIP]
> Components depend on **Clash Display** and **Space Grotesk** — load them once at the project root and every Onda primitive looks right by default. Setup details in [/docs](https://onda.video/docs).

## The catalog

38 components across 6 categories, all built from the same motion vocabulary.

| Category | Count | What lives there |
| --- | --- | --- |
| **Entrances** | 12 | Reveals — fade, slide, scale, rotate, mask, blur, typewriter, word-stagger… |
| **Scenes** | 7 | Composite scene blocks — title cards, lower thirds, stat cards, quote cards… |
| **Data** | 6 | Animated values — counters, percentages, bars, captions… |
| **Graphics** | 5 | Vector & path-based reveals — draw-on strokes, underlines, callouts… |
| **Cinematic** | 5 | Camera-feel motion on images and scenes — Ken Burns, parallax, shake… |
| **Atmosphere** | 3 | Backgrounds and overlays — grain, gradient drift, marquee… |

Browse the full catalog at **[onda.video/components](https://onda.video/components)** — every component has a live preview, a "Try it" props panel, and the exact install command.

## The motion language

The differentiator isn't *what* Onda renders — it's *how*. A small shared vocabulary in [`lib/`](lib/):

- **`SPRING_SMOOTH`** — the house spring. Heavily overdamped, no overshoot. Used everywhere physical motion happens.
- **`DURATION`** — the frame-count scale (`instant`, `fast`, `base`, `slow`, `slower`, `hold`). At 30fps, `base` is 18 frames ≈ 0.6s.
- **`STAGGER`** — 4 frames between siblings. One value. Used in every cascade.
- **`HOUSE_EASE`** — the easing curve for opacity and color fades. `cubic-bezier(0.16, 1, 0.3, 1)`.
- **`COLOR`** — the dusty-rose accent + neutrals. The accent is *earned*, never sprinkled.

When you compose your own components, reach for these instead of hardcoding values. That's what keeps every scene feeling like the same library.

## Documentation

- [Getting started](https://onda.video/docs) — install → fonts → first composition
- [Components catalog](https://onda.video/components) — every primitive, live previews, props
- [Vision](docs/vision.md) — what Onda is, what it's not
- [Design philosophy](docs/design-philosophy.md) — Apple discipline, Onda surface
- [Motion language](docs/motion-language.md) — the moat
- [Component reference](docs/component-reference.md) — the contract every component follows
- [Tech stack](docs/tech-stack.md) · [Product roadmap](docs/product-roadmap.md)

> [!IMPORTANT]
> Building a component or extending the catalog? Start with [CLAUDE.md](CLAUDE.md) — the hard rendering rules (no `Math.random`, no `useState`, pure functions of `useCurrentFrame()`), tokens, and the component contract.

## Repo layout

```
.
├── lib/                  Public motion tokens & helpers (DURATION, SPRING_SMOOTH, …)
├── registry/
│   ├── components/       38 component packages (each: <Name>.tsx, schema.ts, meta.json, README.md)
│   ├── registry.json     Public shadcn-cli manifest (generated by `pnpm sync-registry`)
│   └── r/                Per-component shadcn-cli payload files
├── src/                  Remotion Studio preview entry
├── www/                  Next.js docs + catalog site (onda.video)
├── scripts/              Dev tooling (sync-registry)
└── docs/                 Design philosophy, motion language, techspecs
```

## Scripts

```bash
pnpm dev            # Open Remotion Studio with the current preview component
pnpm render         # Render a composition to MP4
pnpm typecheck      # tsc --noEmit
pnpm sync-registry  # Regenerate registry.json from component meta.json files
```

## Contributing

Bug fixes, new component proposals, and docs improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first; it sets the bar and points at the hard rules in [CLAUDE.md](CLAUDE.md). For security issues see [SECURITY.md](SECURITY.md). The community guidelines live in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

Code is [MIT](LICENSE). Use it, fork it, build commercial products with it — that's the point.

The **Onda name, wordmark, and wave logo** are not covered by the MIT grant. You're welcome to mention Onda when describing your project ("built with Onda") but please don't use the brand as the identifier for a forked, modified, or competing distribution. If you're unsure whether your use is fine, open an issue and ask.
