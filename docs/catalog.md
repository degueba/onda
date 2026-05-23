# Onda catalog

> Single-pane view of what's in `registry/components/`. Updated as components land.

## Totals

- **Built: 38 components** (Entrances 12 · Data 6 · Graphics 5 · Atmosphere 3 · Cinematic 5 · Scenes 7)

## What's built

### Entrances (12)

| Component | One-liner |
| --- | --- |
| `blur-reveal` | Blur + opacity + 16px rise. The reference primitive. |
| `fade-in` | Pure opacity. The simplest reveal. |
| `slide-in` | Direction-parameterized translate + fade (up / down / left / right). |
| `scale-in` | Scale 0.9 → 1.0 + fade. |
| `rotate-in` | Rotation `fromAngle` → 0° + fade. |
| `mask-reveal` | Clip-path entrance, hard pixel-sharp moving edge. |
| `word-stagger` | Multi-word reveal with the canonical 4-frame stagger. |
| `typewriter` | Char-by-char (intentionally linear). |
| `stagger-group` | Composition primitive — sequenced entrance for a list of items. |
| `word-rotate` | Cycles through phrases in place with overlapping fade envelopes. |
| `fade-out` | Pure opacity exit. Faster than entrances by design. |
| `slide-out` | Direction-parameterized translate + fade exit (mirrors SlideIn). |

### Data (6)

| Component | One-liner |
| --- | --- |
| `count-up` | Animated number with tabular nums, en-US locale, optional prefix/suffix. |
| `captions` | Word-by-word kinetic captions driven by a timed array. |
| `bar-chart` | Horizontal bars grow on `SPRING_SMOOTH`; the largest earns the accent. |
| `pie-reveal` | Single SVG arc fills 0 → value% with optional centered label. |
| `progress-bar` | Track-and-fill bar with tabular-num label. |
| `timeline` | Drawn line + staggered dots + labels; the last dot is the accent. |

### Graphics (5)

| Component | One-liner |
| --- | --- |
| `draw-on` | SVG path strokes itself in via `@remotion/paths`. |
| `callout` | Label + arrow annotation pointing at a canvas anchor. |
| `underline` | Two-phase: text fades, then accent-rose line draws beneath. |
| `highlight` | Marker bar slides in behind text — full text-height, accent rose. |
| `icon-pop` | check / cross / dot / star pops in on `SPRING_SMOOTH`. |

### Atmosphere (3)

| Component | One-liner |
| --- | --- |
| `grain-overlay` | Film-grain texture via SVG turbulence. No motion, deliberately. |
| `marquee` | Seamless looping scroll (intentionally linear). |
| `gradient-shift` | Slow-drifting two-color gradient background (intentionally linear). |

### Cinematic (5)

| Component | One-liner |
| --- | --- |
| `ken-burns` | Slow zoom + pan over an image (intentionally linear). |
| `camera-shake` | Deterministic decaying shake via seeded `random()`. |
| `spotlight` | Apple-stage radial light reveal, alpha-aware. |
| `parallax` | Slow horizontal/vertical drift over an image (intentionally linear). |
| `vignette` | Static radial edge darkening — cinematic frame. |

### Scenes (7)

| Component | Composes |
| --- | --- |
| `title-card` | BlurReveal + WordStagger + Underline |
| `lower-third` | SlideIn + FadeIn + Underline |
| `stat-card` | CountUp + WordStagger + Underline |
| `quote-card` | WordStagger + FadeIn + MaskReveal |
| `end-card` | BlurReveal + StaggerGroup + Underline |
| `logo-sting` | DrawOn + ScaleIn + Underline |
| `chapter-card` | FadeIn + BlurReveal + Underline |

## Update protocol

This file is updated alongside any batch that ships components — the same step that updates `registry/registry.json`, `LivePreview.tsx`, and the `r/<slug>.json` manifests.
