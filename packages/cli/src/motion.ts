// The `ondajs/motion` entry point — the runtime motion surface consumers import
// via `from 'ondajs/motion'`. Mirrors the manifest entry's bundling pattern
// (esbuild inlines from ../../../lib with react/remotion left external as peer
// deps). Re-exports the agent-relevant choreography vocabulary + motion tokens
// + easing so a host (e.g. Onda Studio) can drive element animation from the
// SAME tasteful, spring/ease-based primitives the components use — no
// reinvention. Hooks (useEntrance, …) and text/camera helpers can be added here
// as later consumers need them.

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
} from '../../../lib/choreography';

export {
  DURATION,
  STAGGER,
  OVERSHOOT,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
  staggerFrames,
  type DurationToken,
} from '../../../lib/motion';

export { HOUSE_EASE } from '../../../lib/easing';
