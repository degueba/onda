// Re-exports the Zod schema so tooling (registry builds, docs site,
// training-data pipelines) can consume options validation without
// pulling in the transition factory itself.
export { crossFadeSchema, type CrossFadeOptions } from './crossFade';
