// Canonical canvas dimensions for the common video formats. Belongs next
// to lib/tokens.ts in spirit — typed constants so agents and renderers
// don't hardcode 1080×1920 per consumer.

export const CANVAS_PRESETS = {
  /** Vertical social — TikTok, Reels, Shorts. The most common mobile-first format. */
  verticalSocial:   { width: 1080, height: 1920, fps: 30 },
  /** Horizontal social — YouTube landscape, X feed. */
  horizontalSocial: { width: 1920, height: 1080, fps: 30 },
  /** Square — Instagram feed, LinkedIn. */
  square:           { width: 1080, height: 1080, fps: 30 },
  /** Portrait feed — Instagram 4:5. */
  portraitFeed:     { width: 1080, height: 1350, fps: 30 },
  /** Cinematic 4K — hero / premium. 24fps for film feel. */
  cinematic4k:      { width: 3840, height: 2160, fps: 24 },
} as const;

export type CanvasPreset = keyof typeof CANVAS_PRESETS;

/**
 * Accept either a named preset (`'verticalSocial'`) or an explicit
 * `{width, height, fps?}` and return canonical `{width, height, fps}`.
 * `fps` defaults to 30 when omitted in object form.
 */
export function resolveCanvas(
  spec: CanvasPreset | { width: number; height: number; fps?: number },
): { width: number; height: number; fps: number } {
  if (typeof spec === 'string') return { ...CANVAS_PRESETS[spec] };
  return { width: spec.width, height: spec.height, fps: spec.fps ?? 30 };
}
