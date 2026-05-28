import { ImageResponse } from 'next/og';
import { getComponent, listComponentSlugs } from '@/lib/registry';

// Per-component social share image. Generated at build time for every
// slug in the registry so each /components/<slug> link gets its own
// branded preview when shared.
//
// Layout: small brand mark + "ONDA" wordmark in the corner, component
// title front-and-center, description below, category eyebrow, footer
// pinning the URL. Same dark canvas + restrained accent glow as the
// homepage OG so all share previews feel like one set.
//
// Satori quirks to respect here:
//   - Every container that has more than one child needs an explicit
//     `display: flex` (or `display: none`). Plain block divs error at
//     render time.
//   - `zIndex` is treated as a length by Satori — leaving it out and
//     using DOM order for layering instead.

export const alt = `Onda component`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listComponentSlugs().map((slug) => ({ slug }));
}

export default async function ComponentOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getComponent(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08080A',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          color: '#F2F2F4',
          padding: 72,
          position: 'relative',
        }}
      >
        {/* Inset border — same premium card edge the site uses.
            No radial accent glow here on purpose — see opengraph-image.tsx
            for the rationale: subtle dark-on-dark gradients band into
            visible pixelation under Facebook/LinkedIn JPEG compression.
            A clean solid canvas survives the resize intact. */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '1px solid #1C1C22',
            borderRadius: 24,
            display: 'flex',
          }}
        />

        {/* Brand row — wave mark + wordmark, sits top-left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <svg
            width="120"
            height="30"
            viewBox="0 0 48 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="g"
                x1="0"
                x2="48"
                gradientUnits="userSpaceOnUse"
              >
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
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#F2F2F4',
              display: 'flex',
            }}
          >
            Onda
          </div>
        </div>

        {/* Category eyebrow — pushed to the bottom half via marginTop: auto */}
        <div
          style={{
            marginTop: 'auto',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#D96B82',
            display: 'flex',
          }}
        >
          {item.category}
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 16,
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            color: '#F2F2F4',
            maxWidth: 980,
            display: 'flex',
          }}
        >
          {item.title}
        </div>

        {/* Description */}
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 400,
            color: '#8E8E98',
            maxWidth: 980,
            lineHeight: 1.35,
            display: 'flex',
          }}
        >
          {truncate(item.description, 180)}
        </div>

        {/* Footer URL */}
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#56565F',
            display: 'flex',
          }}
        >
          onda.video/components/{item.name}
        </div>
      </div>
    ),
    size,
  );
}

// Hard-clamp the description so very long ones don't overflow the card.
// Cuts at the last word before the limit, then appends an ellipsis.
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}
