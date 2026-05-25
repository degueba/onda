import { slide as remotionSlide, type SlideProps as RemotionSlideProps } from '@remotion/transitions/slide';
import type { TransitionPresentation } from '@remotion/transitions';
import { slideSchema, type SlideOptions } from './schema';

export { slideSchema, type SlideOptions };

// User-facing direction vocabulary maps to Remotion's. Going with motion
// direction ("slide left" = scene moves left = enters from the right)
// because that's how most editors and motion-design tools name it.
const DIRECTION_MAP = {
  left: 'from-right',
  right: 'from-left',
  up: 'from-bottom',
  down: 'from-top',
} as const;

/**
 * A directional slide between two scenes — only the incoming scene
 * translates; the outgoing scene stays in place. For both-scenes-move
 * together (camera-pan feel), use {@link push} instead.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Wraps Remotion's `slide()`.
 */
export function slide(
  options?: SlideOptions,
): TransitionPresentation<RemotionSlideProps> {
  const opts = slideSchema.parse(options ?? {});
  return remotionSlide({ direction: DIRECTION_MAP[opts.direction] });
}

export default slide;
