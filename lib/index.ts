// The public surface of `lib/` — re-exported here so consumers can do
// `import { entryFadeRise, DURATION } from '@/lib'` and IDE auto-import
// resolves to a single namespace.
//
// New helpers / tokens added under `lib/` should be re-exported below so the
// barrel stays the authoritative public API.

export {
  DURATION,
  STAGGER,
  OVERSHOOT,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
  staggerFrames,
  type DurationToken,
} from './motion';

export { HOUSE_EASE } from './easing';

export { seededRandom } from './random';

export {
  holdFramesForText,
  holdFramesForString,
  countWords,
} from './text-timing';

export {
  entryFade,
  entrySlide,
  entryScale,
  entryFadeRise,
  exitFadeFall,
  heroReveal,
  stateSwap,
  type MotionStyle,
  type PatternInput,
} from './choreography';

export {
  COLOR,
  FONT,
  SPACING,
  SAFE_MARGIN_RATIO,
  type ColorToken,
  type FontToken,
} from './tokens';

export {
  ANCHORS,
  PLACEMENT_REGIONS,
  SIZE_ROLES,
  PlacementBox,
  resolvePlacement,
  resolveSize,
  anchorSchema,
  placementCoordsSchema,
  placementRegionSchema,
  placementSchema,
  sizeRoleSchema,
  type Anchor,
  type Placement,
  type PlacementCoords,
  type PlacementRegion,
  type PlacementBoxProps,
  type SizeRole,
} from './canvas';
