# SkeletonCard

A loading-placeholder card — the "still generating / not loaded yet" state shown before real content populates. A glass `Surface` holds an optional thumbnail block plus a stack of text bars (deterministic, varying widths), with a single highlight band sweeping across them on a frame-driven loop — the same moving-gradient idea as `ShimmerSweep`, but a soft sheen over the bars rather than a text clip. The card rises in on the house spring; the shimmer keeps moving so the placeholder feels live. Token defaults look great with zero props.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `lines` | `number` | `3` | Number of text bars below the thumbnail. |
| `thumbnail` | `boolean` | `true` | Show the leading avatar / thumbnail block. |
| `shimmerSpeed` | `number` | `48` | Frames per shimmer pass; lower is faster. |
| `shimmerColor` | `string` | `#26262E` | Travelling sheen color (`--onda-border-lit`). |
| `barColor` | `string` | `#121217` | Resting fill of bars / thumbnail (`--onda-surface-2`). |
| `delay` | `number` | `0` | Frames before entrance. |
| `width` | `number` | `480` | Card width. |
| `height` | `number` | — | Card height; omit to size to content. |
| `size` | `'hero' \| 'heading' \| 'subheading' \| 'body' \| 'caption'` | — | Semantic role for base bar height (canvas-aware). |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { SkeletonCard } from './components/onda/skeleton-card/SkeletonCard';

export const LoadingScene = () => (
  <SkeletonCard lines={3} thumbnail placement="center" />
);
```
