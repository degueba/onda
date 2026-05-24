// Canvas-aware placement and sizing for Onda components.
//
// Components reach for these helpers instead of inventing their own positioning
// math, so a caller can place and size anything in the catalog with one
// vocabulary across any canvas dimension. See `docs/techspecs/008-canvas-aware-components/`
// for the full rationale.
//
// Two concepts live here:
//
//  1. **Placement** — where on the canvas a component sits. Accepts either a
//     named region (`'center'`, `'upper-third'`, `'top-right'`, ...) or a
//     coordinate object (`{ x, y, anchor }`) with 0..1 canvas fractions. Coords
//     are **unclamped** — entrances from `x: 1.1` or exits at `y: -0.2` are
//     first-class.
//
//  2. **Size roles** — semantic sizes (`'hero'`, `'heading'`, `'body'`, ...)
//     that resolve to a pixel value via the *smaller* canvas dimension, so the
//     same role reads at the same visual weight on horizontal, vertical, or
//     square compositions.

import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';

// -----------------------------------------------------------------------------
// Placement
// -----------------------------------------------------------------------------

/**
 * Which point of a component sits at the placement coordinates. The visual
 * intuition: `'top-left'` means the component's top-left corner touches the
 * placement point; `'center'` (default) centers the component on it.
 */
export const ANCHORS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;

export type Anchor = (typeof ANCHORS)[number];

export const anchorSchema = z.enum(ANCHORS);

/**
 * Fractional canvas coordinates. Values outside `0..1` are valid and intended
 * — off-canvas placements drive entrances, exits, and deliberate bleed.
 *
 * - `x` — fraction of canvas width (`0` left edge, `1` right edge).
 * - `y` — fraction of canvas height (`0` top edge, `1` bottom edge).
 * - `anchor` — which point of the component sits at (`x`, `y`). Defaults to `'center'`.
 */
export type PlacementCoords = {
  x: number;
  y: number;
  anchor?: Anchor;
};

export const placementCoordsSchema = z.object({
  x: z.number(),
  y: z.number(),
  anchor: anchorSchema.optional(),
});

/**
 * Named regions — ergonomic shorthand for the most common placements. Each
 * region picks both a coordinate and the matching anchor (so `'top-left'`
 * actually puts the component's top-left at the canvas's top-left, not its
 * center on the canvas's top-left).
 */
export const PLACEMENT_REGIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'upper-third',
  'lower-third',
] as const;

export type PlacementRegion = (typeof PLACEMENT_REGIONS)[number];

export const placementRegionSchema = z.enum(PLACEMENT_REGIONS);

/**
 * Where a component sits on the canvas. Pass a region string for the common
 * cases, or a coordinate object for fine control.
 *
 * @example
 * placement="upper-third"
 * placement={{ x: 0.3, y: 0.7, anchor: 'top-left' }}
 * placement={{ x: 1.1, y: 0.5 }}  // off-canvas — slides in from the right
 */
export type Placement = PlacementRegion | PlacementCoords;

export const placementSchema = z.union([placementRegionSchema, placementCoordsSchema]);

const REGION_MAP: Record<PlacementRegion, Required<PlacementCoords>> = {
  'center':       { x: 0.5,  y: 0.5,  anchor: 'center' },
  'top':          { x: 0.5,  y: 0.15, anchor: 'top' },
  'bottom':       { x: 0.5,  y: 0.85, anchor: 'bottom' },
  'left':         { x: 0.15, y: 0.5,  anchor: 'left' },
  'right':        { x: 0.85, y: 0.5,  anchor: 'right' },
  'top-left':     { x: 0.1,  y: 0.1,  anchor: 'top-left' },
  'top-right':    { x: 0.9,  y: 0.1,  anchor: 'top-right' },
  'bottom-left':  { x: 0.1,  y: 0.9,  anchor: 'bottom-left' },
  'bottom-right': { x: 0.9,  y: 0.9,  anchor: 'bottom-right' },
  'upper-third':  { x: 0.5,  y: 0.28, anchor: 'center' },
  'lower-third':  { x: 0.5,  y: 0.72, anchor: 'center' },
};

const DEFAULT_PLACEMENT: Required<PlacementCoords> = {
  x: 0.5,
  y: 0.5,
  anchor: 'center',
};

/**
 * Normalize a {@link Placement} to its canonical coordinate form. Regions
 * expand via {@link REGION_MAP}; coordinate objects pass through with
 * `anchor` defaulting to `'center'`. `undefined` resolves to canvas center.
 *
 * Coordinates are **not clamped** — off-canvas placements are intentional.
 */
export function resolvePlacement(p: Placement | undefined): Required<PlacementCoords> {
  if (p === undefined) return DEFAULT_PLACEMENT;
  if (typeof p === 'string') return REGION_MAP[p];
  return { anchor: 'center', ...p };
}

const ANCHOR_TO_TRANSFORM: Record<Anchor, string> = {
  'center':       'translate(-50%, -50%)',
  'top':          'translate(-50%, 0)',
  'bottom':       'translate(-50%, -100%)',
  'left':         'translate(0, -50%)',
  'right':        'translate(-100%, -50%)',
  'top-left':     'translate(0, 0)',
  'top-right':    'translate(-100%, 0)',
  'bottom-left':  'translate(0, -100%)',
  'bottom-right': 'translate(-100%, -100%)',
};

const ANCHOR_TO_TEXT_ALIGN: Record<Anchor, 'left' | 'center' | 'right'> = {
  'center':       'center',
  'top':          'center',
  'bottom':       'center',
  'left':         'left',
  'right':        'right',
  'top-left':     'left',
  'top-right':    'right',
  'bottom-left':  'left',
  'bottom-right': 'right',
};

export type PlacementBoxProps = {
  /** Where the box sits on the canvas. Defaults to centered. */
  placement?: Placement;
  children: React.ReactNode;
};

/**
 * Canvas-aware positioning wrapper. Use as the outer element of any component
 * that should be placeable on the canvas — replaces ad-hoc
 * `<AbsoluteFill style={{ justifyContent, alignItems }}>` patterns.
 *
 * The inner box uses percentage positioning so it works on any canvas
 * dimension without reading {@link useVideoConfig}. Default text alignment
 * follows the anchor (`'left'` for left anchors, `'right'` for right anchors,
 * `'center'` for the rest); components override on their own elements when
 * they want different behavior.
 *
 * @example
 * <PlacementBox placement="upper-third">
 *   <h1 style={{ fontSize: 96 }}>Hello</h1>
 * </PlacementBox>
 */
export const PlacementBox: React.FC<PlacementBoxProps> = ({ placement, children }) => {
  const { x, y, anchor } = resolvePlacement(placement);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: ANCHOR_TO_TRANSFORM[anchor],
          maxWidth: '100%',
          textAlign: ANCHOR_TO_TEXT_ALIGN[anchor],
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Size roles
// -----------------------------------------------------------------------------

/**
 * Semantic typography sizes. Each role resolves to a pixel value via the
 * *smaller* canvas dimension — so `'heading'` reads at the same visual weight
 * on horizontal (1920×1080), vertical (1080×1920), and square compositions.
 *
 * Components accept `size` as an opt-in alongside their numeric `fontSize`
 * default; passing both, `fontSize` wins (explicit beats semantic).
 *
 * Calibrated against the catalog's current `fontSize` defaults so existing
 * components migrating to a role land within 1–2px of their previous pixels
 * on a 1080-shortest-dim canvas.
 */
export const SIZE_ROLES = {
  hero:       0.15,
  heading:    0.09,
  subheading: 0.052,
  body:       0.03,
  caption:    0.02,
} as const;

export type SizeRole = keyof typeof SIZE_ROLES;

export const sizeRoleSchema = z.enum(
  Object.keys(SIZE_ROLES) as [SizeRole, ...SizeRole[]],
);

/**
 * Resolve a {@link SizeRole} to a pixel value for the given canvas dimensions.
 * Scales off `min(width, height)` so the same role lands at the same weight
 * regardless of orientation.
 *
 * @example
 * const { width, height } = useVideoConfig();
 * const px = resolveSize('heading', { width, height });
 */
export function resolveSize(
  role: SizeRole,
  canvas: { width: number; height: number },
): number {
  return Math.round(SIZE_ROLES[role] * Math.min(canvas.width, canvas.height));
}
