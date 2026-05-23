# Onda catalog

> Single-pane view of what's in `registry/components/`. Updated as components land.

## Totals

- **Built: 26 components** (Entrances 9 · Data 3 · Graphics 3 · Atmosphere 3 · Cinematic 2 · Scenes 6)
- **In queue: 12 items** remaining (see [cron-queue.md](cron-queue.md))
- **Target: 38 components** across 6 categories once the queue is built

## What's built

### Entrances (9)

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

### Data (1)

| Component | One-liner |
| --- | --- |
| `count-up` | Animated number with tabular nums, en-US locale, optional prefix/suffix. |

### Graphics (3)

| Component | One-liner |
| --- | --- |
| `draw-on` | SVG path strokes itself in via `@remotion/paths`. |
| `callout` | Label + arrow annotation pointing at a canvas anchor. |
| `underline` | Two-phase: text fades, then accent-rose line draws beneath. |

### Atmosphere (2)

| Component | One-liner |
| --- | --- |
| `grain-overlay` | Film-grain texture via SVG turbulence. No motion, deliberately. |
| `marquee` | Seamless looping scroll (intentionally linear). |

### Cinematic (1)

| Component | One-liner |
| --- | --- |
| `ken-burns` | Slow zoom + pan over an image. The first image primitive. |

## What's coming (next 22, from [cron-queue.md](cron-queue.md))

### Round A (1–14)

| # | Slug | Category | Type |
| --- | --- | --- | --- |
| 1 | `captions` | data | primitive |
| 2 | `bar-chart` | data | primitive |
| 3 | `lower-third` | scenes | **scene block** |
| 4 | `title-card` | scenes | **scene block** |
| 5 | `stat-card` | scenes | **scene block** |
| 6 | `quote-card` | scenes | **scene block** |
| 7 | `end-card` | scenes | **scene block** |
| 8 | `logo-sting` | scenes | **scene block** |
| 9 | `camera-shake` | cinematic | primitive |
| 10 | `gradient-shift` | atmosphere | primitive |
| 11 | `word-rotate` | entrances | primitive |
| 12 | `spotlight` | cinematic | primitive |
| 13 | `highlight` | graphics | primitive |
| 14 | `pie-reveal` | data | primitive |

### Round B (15–22)

| # | Slug | Category | Type |
| --- | --- | --- | --- |
| 15 | `progress-bar` | data | primitive |
| 16 | `timeline` | data | primitive |
| 17 | `icon-pop` | graphics | primitive |
| 18 | `fade-out` | entrances | primitive (exit) |
| 19 | `slide-out` | entrances | primitive (exit) |
| 20 | `parallax` | cinematic | primitive |
| 21 | `vignette` | cinematic | primitive |
| 22 | `chapter-card` | scenes | **scene block** |

## Categories after queue is built

| Category | Built | In queue | Total |
| --- | --- | --- | --- |
| Entrances | 9 | 3 | 12 |
| Data | 1 | 5 | 6 |
| Graphics | 3 | 2 | 5 |
| Atmosphere | 2 | 1 | 3 |
| Cinematic | 1 | 4 | 5 |
| **Scenes** *(new)* | 0 | 7 | 7 |
| **Total** | **16** | **22** | **38** |

## Update protocol

This file is updated alongside any batch that ships components — the same step that updates `registry/registry.json`, `LivePreview.tsx`, and the `r/<slug>.json` manifests.
