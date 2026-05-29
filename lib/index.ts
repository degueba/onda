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
  SHUTTER,
  staggerFrames,
  type DurationToken,
} from './motion';

export { HOUSE_EASE } from './easing';

export {
  RADIUS,
  SHADOW,
  SHEEN,
  GLOW,
  BLUR,
  GRAIN_OPACITY,
  type RadiusToken,
  type ShadowToken,
  type GlowToken,
  type BlurToken,
} from './elevation';

export { seededRandom } from './random';

export {
  useEntrance,
  useStaggeredEntrance,
  useSpringValue,
  useSceneProgress,
  useSeededRandom,
  useTextReveal,
  useCameraRig,
  type EntranceType,
  type EntranceOptions,
  type CameraKeyframe,
} from './hooks';

export {
  Surface,
  Glow,
  GridField,
  Camera,
  MotionBlur,
  MotionTrail,
  type SurfaceProps,
  type GlowProps,
  type GridFieldProps,
  type CameraProps,
  type MotionBlurProps,
  type MotionTrailProps,
} from './primitives';

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

export { parseTime, toFrames } from './timing';

export {
  entrySchema,
  trackSchema,
  compositionSchema,
  type Entry,
  type Track,
  type Composition,
} from './composition';

export {
  CompositionRenderer,
  type ComponentRegistry,
  type CompositionRendererProps,
} from './composition-renderer';

export {
  compositionJsonSchema,
  entryJsonSchema,
} from './composition-json-schema';

export {
  CANVAS_PRESETS,
  resolveCanvas,
  type CanvasPreset,
} from './canvas-presets';

export {
  summarizeRegistry,
  summarizeRegistryAsMarkdown,
  type RegistrySummary,
  type RegistryComponentSummary,
  type RegistryPropSummary,
  type CatalogMeta,
  type CatalogMetaEntry,
} from './registry-summary';

export {
  AdaptivePlayer,
  useAdaptiveCompositionSize,
  DEFAULT_MIN_RENDER_LONG_EDGE,
  type AdaptivePlayerProps,
} from './adaptive-player';
