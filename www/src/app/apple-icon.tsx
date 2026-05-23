import { ImageResponse } from 'next/og';

// Apple touch icon — generated dynamically as a 180×180 PNG via ImageResponse.
//
// Why a TSX generator instead of a static file: Next.js's app-router file
// convention for apple-icon only supports raster formats (.png/.jpg/.jpeg),
// not SVG. Rather than committing a hand-rendered PNG that drifts from the
// source-of-truth wave path, we render the same canonical 48×12 path inline
// through Satori (next/og) and let Next produce the PNG at request time.
//
// The result mirrors `app/icon.svg` in shape but adds the dark Onda canvas
// background (iOS layers its own rounded-corner mask on top, so the
// background needs to fill the full 180×180 box).
//
// Note: the mix-blend-mode highlight from the website's BrandMark is dropped
// here. Satori's SVG renderer doesn't honor mix-blend-mode reliably; at
// 180×180 the gradient alone reads correctly and adding a non-rendering
// highlight overlay would just add weight.

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08080A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Inline SVG using the canonical wave path scaled to fit. The
            gradient stops match BrandMark exactly so the icon stays in
            visual lockstep with the website logo. */}
        <svg
          width="140"
          height="35"
          viewBox="0 0 48 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g" x1="0" x2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F2F2F4" />
              <stop offset="25%" stopColor="#E89AAB" />
              <stop offset="50%" stopColor="#D96B82" />
              <stop offset="75%" stopColor="#E89AAB" />
              <stop offset="100%" stopColor="#F2F2F4" />
            </linearGradient>
          </defs>
          <path
            d="M 2 6 C 7 1, 13 1, 17 6 C 21 11, 27 11, 31 6 C 35 1, 41 1, 46 6"
            stroke="url(#g)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
