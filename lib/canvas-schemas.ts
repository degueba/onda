// Canvas-aware placement and sizing — pure Zod schemas + constants.
// Split from `lib/canvas.tsx` so tooling that only consumes the schemas
// (the runtime `manifest` export, training-data pipelines, validators)
// can import without pulling React and Remotion into its bundle.
//
// React-using utilities (`PlacementBox`, `resolveSize`, `resolvePlacement`)
// stay in `lib/canvas.tsx`, which re-exports everything here.

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
