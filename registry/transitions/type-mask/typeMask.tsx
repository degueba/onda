import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { typeMaskSchema, type TypeMaskOptions } from './schema';

export { typeMaskSchema, type TypeMaskOptions };

type TypeMaskProps = {
  text: string;
  holdFrames: number;
  maxScale: number;
  color: string;
  fontFamily: string;
};

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Render the word into an SVG data URI so it can drive a CSS mask. The viewBox
// is square and the text is centered; scaling the host element scales this
// mask with it, so the letterforms — and the negative space they frame — grow
// together. White = revealed, transparent = hidden.
function maskUri(text: string, fontFamily: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'>` +
    `<text x='500' y='500' text-anchor='middle' dominant-baseline='central' ` +
    `font-family='${fontFamily.replace(/'/g, '"')}' font-weight='700' font-size='420' fill='white'>` +
    `${text}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const TypeMaskPresentation: React.FC<
  TransitionPresentationComponentProps<TypeMaskProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { text, holdFrames, maxScale, color, fontFamily } = passedProps;
  const isEntering = presentationDirection === 'entering';

  // The outgoing scene renders untouched beneath; only the entering layer is
  // masked by the type, so we leave exiting frames alone.
  if (!isEntering) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // Hold the type at rest, then scale it exponentially so the negative space
  // inside the letters blows past the screen edges. Progress past `holdFrames`
  // is remapped to 0..1 and eased — no overshoot, settles into full reveal.
  const open = interpolate(presentationProgress, [holdFrames, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  // Exponential growth: 1 -> maxScale. Reads as an accelerating zoom into the type.
  const scale = Math.pow(maxScale, open);

  const uri = maskUri(text, fontFamily);

  // The colored word holds solid over the outgoing scene, then dissolves as the
  // interior opens to reveal the incoming scene through the type.
  const wordOpacity = interpolate(open, [0, 0.18], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Solid held word — fades out the instant the type starts opening. */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          opacity: wordOpacity,
          maskImage: uri,
          WebkitMaskImage: uri,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          backgroundColor: color,
        }}
      />
      {/* Incoming scene, seen only through the type as it scales to fill. */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          maskImage: uri,
          WebkitMaskImage: uri,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      >
        {/* Counter-scale so the scene content stays at 1:1 while the mask grows. */}
        <AbsoluteFill style={{ transform: `scale(${1 / scale})` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A giant word holds briefly, then scales up exponentially until the negative
 * space inside its letters blows past the screen edges — and the incoming
 * scene is revealed through the type. The masking word starts solid over the
 * outgoing scene, then dissolves into a window onto the next scene. Kinetic and
 * typographic; reaches for punch, not calm.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function typeMask(
  options?: TypeMaskOptions,
): TransitionPresentation<TypeMaskProps> {
  const opts = typeMaskSchema.parse(options ?? {});
  return {
    component: TypeMaskPresentation,
    props: {
      text: opts.text,
      holdFrames: opts.holdFrames,
      maxScale: opts.maxScale,
      color: opts.color,
      fontFamily: opts.fontFamily,
    },
  };
}

export default typeMask;
