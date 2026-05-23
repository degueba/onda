// Re-exports the Zod schema so tooling (registry builds, docs site,
// training-data pipelines) can consume props validation without pulling
// in the component itself.
export { timelineSchema, type TimelineProps } from './Timeline';
