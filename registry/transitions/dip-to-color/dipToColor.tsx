import React from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link dipToColor} options. */
export const dipToColorSchema = z.object({
  /**
   * Solid color to dip through. Default `#08080A` (Onda canvas bg) for
   * brand consistency. Pass `'#000'` for the editing-room classic
   * dip-to-black, or `'#fff'` for dip-to-white.
   */
  color: z.string().default('#08080A'),
});

export type DipToColorOptions = z.input<typeof dipToColorSchema>;

type DipToColorProps = { color: string };

const DipToColorPresentation: React.FC<TransitionPresentationComponentProps<DipToColorProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const isEntering = presentationDirection === 'entering';

  // Two-stage dip:
  //   First half  (progress 0..0.5): outgoing fades to color
  //   Second half (progress 0.5..1): incoming fades up from color
  //
  // Scene opacity follows a triangular wave that peaks at midpoint (0)
  // and is 1 at both ends. Color overlay does the opposite — peaks
  // at midpoint, 0 at both ends — so the dip color is most visible
  // when both scenes are most faded.
  const sceneOpacity = isEntering
    ? Math.max(0, presentationProgress * 2 - 1) // 0 until 0.5, then ramps to 1
    : Math.max(0, 1 - presentationProgress * 2); // 1 at 0, ramps to 0 at 0.5
  const colorOpacity = isEntering
    ? Math.max(0, 1 - (presentationProgress - 0.5) * 2) // 1 at 0.5, ramps to 0 at 1
    : Math.min(1, presentationProgress * 2); // 0 at 0, ramps to 1 at 0.5

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: sceneOpacity }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: passedProps.color,
          opacity: colorOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The editing-room classic — outgoing scene fades to a solid color,
 * incoming fades up from it. Reads as "time passes" or "scene break."
 * Default color is `--onda-bg` (`#08080A`) for brand consistency; pass
 * `'#000'` for traditional dip-to-black or `'#fff'` for dip-to-white.
 *
 * Pair with the recommended Onda timing for the house feel — though
 * for dipToColor specifically, a longer duration (30-45 frames) often
 * reads more like a deliberate beat break:
 * `linearTiming({ durationInFrames: 30, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function dipToColor(
  options?: DipToColorOptions,
): TransitionPresentation<DipToColorProps> {
  const opts = dipToColorSchema.parse(options ?? {});
  return {
    component: DipToColorPresentation,
    props: { color: opts.color },
  };
}

export default dipToColor;
