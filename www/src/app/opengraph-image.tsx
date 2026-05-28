import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/seo';

// Social share image. Next routes this file to /opengraph-image (and
// surfaces it as `<meta property="og:image">` on the home route + every
// child page that doesn't override it). Twitter sees the same image via
// `twitter-image.tsx` next to this file.
//
// Format: 1200×630 PNG — the standard size honored by Twitter/X, LinkedIn,
// Slack, Discord, iMessage, Facebook, and the Search Console preview.
//
// Render rules: Satori (the engine behind next/og) is a strict subset of
// CSS — no mix-blend-mode, no filter, no Tailwind classes. Style everything
// inline. The wave path here mirrors `app/icon.svg` so the share preview
// stays in visual lockstep with the favicon and brand mark.

export const runtime = 'edge';
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08080A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#F2F2F4',
          position: 'relative',
        }}
      >
        {/* One restrained accent glow, anchored behind the wave. Radial
            gradient keeps the rose contained to the upper third so the
            wordmark below stays on neutral canvas. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(ellipse 700px 320px at 50% 36%, rgba(217,107,130,0.22), rgba(217,107,130,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Subtle border-lit frame. 1px feels invisible at 1200px, so we use
            an inset shadow on a slightly inset rect to suggest the same
            premium card edge the site uses. */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '1px solid #1C1C22',
            borderRadius: 24,
            display: 'flex',
          }}
        />

        {/* The wave — same path the favicon uses, scaled large. Five-stop
            horizontal gradient matches BrandMark exactly. */}
        <svg
          width="720"
          height="180"
          viewBox="0 0 48 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 56 }}
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
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Wordmark — Onda set tight, large. Sans-serif fallback is fine
            here; Satori would need a font fetch to render Clash Display
            and the bandwidth cost isn't worth the difference at this size. */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#F2F2F4',
            display: 'flex',
          }}
        >
          Onda
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#8E8E98',
            textAlign: 'center',
            maxWidth: 940,
            lineHeight: 1.25,
            display: 'flex',
          }}
        >
          {SITE.tagline}
        </div>

        {/* Footer eyebrow — provenance + URL. Letter-spaced uppercase
            matches the site's small-caps labels. */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 72,
            paddingRight: 72,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#56565F',
          }}
        >
          <span>Built on Remotion</span>
          <span>onda.video</span>
        </div>
      </div>
    ),
    size,
  );
}
