// Canvas-aware placement and sizing for Onda components.
// See `docs/techspecs/008-canvas-aware-components/` for rationale.

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

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

/** Coordinates are NOT clamped — off-canvas placements (entrances, exits, bleed) are intentional. */
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
 * @example
 * placement="upper-third"
 * placement={{ x: 0.3, y: 0.7, anchor: 'top-left' }}
 * placement={{ x: 1.1, y: 0.5 }}  // off-canvas — slides in from the right
 */
export type Placement = PlacementRegion | PlacementCoords;
export const placementSchema = z.union([placementRegionSchema, placementCoordsSchema]);

// Anchor picked so the region's name matches its visual intent —
// 'top-left' puts the component's top-left corner near the canvas's
// top-left (10% safe margin), not its center.
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

const DEFAULT_PLACEMENT: Required<PlacementCoords> = { x: 0.5, y: 0.5, anchor: 'center' };

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
  placement?: Placement;
  children: React.ReactNode;
};

/**
 * Canvas-aware positioning wrapper. Default text-align follows the anchor
 * (left anchors → `'left'`, right → `'right'`, else `'center'`); components
 * override on their own inner element when they want different behavior.
 *
 * Passing `placement` makes the component its own `AbsoluteFill` layer —
 * it parks at the canvas anchor regardless of parent. For stacked
 * layouts, omit `placement` on the children and let a wrapping flex
 * container do the centering; otherwise multiple `placement="center"`
 * siblings will overlap at the same canvas point.
 *
 * @example
 * <PlacementBox placement="upper-third">
 *   <h1 style={{ fontSize: 96 }}>Hello</h1>
 * </PlacementBox>
 */
export const PlacementBox: React.FC<PlacementBoxProps> = ({ placement, children }) => {
  // Pass-through when placement is undefined — let the parent's layout
  // decide where this sits. Critical for composers (TitleCard, StatCard,
  // etc.) that arrange their own children inside a flex column: a child
  // wrapping itself in PlacementBox+AbsoluteFill would escape the parent
  // flow and stack on top of its siblings at canvas-center, breaking the
  // composer's layout. Standalone use that wants centering should pass
  // `placement="center"` explicitly — the catalog reel hero does this.
  if (placement === undefined) {
    return <>{children}</>;
  }
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

/**
 * Semantic typography sizes — fraction of the *smaller* canvas dimension, so
 * the same role reads at the same weight on horizontal, vertical, or square.
 * Calibrated against the catalog's current `fontSize` defaults — passing a
 * role lands within 1–2px of the previous pixel default on a 1080-min canvas.
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

export function resolveSize(
  role: SizeRole,
  canvas: { width: number; height: number },
): number {
  return Math.round(SIZE_ROLES[role] * Math.min(canvas.width, canvas.height));
}
