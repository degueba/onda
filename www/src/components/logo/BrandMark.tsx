// The Onda brand mark — Mercury treatment.
//
// A 1.5-cycle gradient wave that draws on with HOUSE_EASE, then settles
// into a slow horizontal gradient drift. A vertical white-to-transparent
// highlight overlay on a narrower stroke gives the line dimensional depth
// — the wave reads as a polished tube lit from above rather than a flat
// stroke.
//
// This is the canonical animated mark. For static contexts (favicons,
// README icons, README hero), use the SVG files in /assets instead.

import {
  WAVE_PATH,
  WAVE_VIEWBOX,
  WAVE_VIEWBOX_W,
  WAVE_VIEWBOX_H,
  WAVE_ASPECT,
} from './WavePath';

type BrandMarkProps = {
  /** Pixel height of the mark. Width scales to keep the 4:1 wave aspect. */
  height?: number;
  /** Play the entry animations on mount. */
  animate?: boolean;
  /** Optional className for the outer SVG (positioning, color, etc). */
  className?: string;
};

export function BrandMark({
  height = 24,
  animate = true,
  className,
}: BrandMarkProps) {
  return (
    <svg
      viewBox={WAVE_VIEWBOX}
      height={height}
      width={height * WAVE_ASPECT}
      fill="none"
      aria-label="Onda"
      role="img"
      className={className}
    >
      <defs>
        {/* Horizontal color gradient — five stops. Smooth flanks via
            accent-soft so the rose enters and exits gently rather than
            stepping. */}
        <linearGradient
          id="onda-brand-base"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={WAVE_VIEWBOX_W}
          y2="0"
        >
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="25%" stopColor="var(--color-onda-accent-soft)" />
          <stop offset="50%" stopColor="var(--color-onda-accent)" />
          <stop offset="75%" stopColor="var(--color-onda-accent-soft)" />
          <stop offset="100%" stopColor="currentColor" />

          {animate && (
            <>
              <animate
                attributeName="x1"
                values={`0;${-WAVE_VIEWBOX_W * 0.18};0`}
                dur="7s"
                begin="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={`${WAVE_VIEWBOX_W};${WAVE_VIEWBOX_W * 1.18};${WAVE_VIEWBOX_W}`}
                dur="7s"
                begin="1s"
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>

        {/* Vertical highlight — white at the top of the viewBox, fading to
            transparent. Applied as a thinner stroke layered on top of the
            base, this paints a specular highlight along the upper edge of
            the "tube." */}
        <linearGradient
          id="onda-brand-shine"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={WAVE_VIEWBOX_H}
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.65" />
          <stop offset="40%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Base — the colored "tube body." */}
      <path
        d={WAVE_PATH}
        stroke="url(#onda-brand-base)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={animate ? 100 : undefined}
        className={animate ? 'logo-draw-on' : undefined}
      />
      {/* Highlight — narrower stroke, vertical white→transparent, additive
          blend so the warm rose underneath stays warm rather than washing out. */}
      <path
        d={WAVE_PATH}
        stroke="url(#onda-brand-shine)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ mixBlendMode: 'screen' }}
        pathLength={100}
        strokeDasharray={animate ? 100 : undefined}
        className={animate ? 'logo-draw-on' : undefined}
      />
    </svg>
  );
}
