import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Caveat } from 'next/font/google';
import { SITE } from '@/lib/seo';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

// Caveat — flowing handwriting font. Used by the WavePen hero experiment
// where the wave appears to "write" phrases on screen. Restricted to the
// weights we actually use to keep the font bundle small.
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

// Site-wide metadata. Per-page exports (title, description, openGraph) merge
// on top of these via Next 15's metadata inheritance. The `title.template`
// gives every child page "<Page Title> — Onda" without each page having to
// know the brand.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    ...(SITE.twitter ? { creator: SITE.twitter, site: SITE.twitter } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Icons are picked up automatically from the app-router file conventions:
  //   app/icon.svg       → <link rel="icon" type="image/svg+xml" ...>
  //   app/apple-icon.tsx → <link rel="apple-touch-icon" ...> (PNG 180×180)
  // No explicit override needed — leaving this block out lets Next's
  // metadata system inject the discovered files. If we later add light/dark
  // SVG variants, those go here too.
};

// Viewport / theme-color split out per Next 15's metadata API. Dark color
// scheme lock matches the brand surface; hint to mobile UA chrome to match.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08080A',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Organization-level JSON-LD. Tells Google "this site is the Onda brand";
  // helps with knowledge-panel eligibility once the project earns it.
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    sameAs: [SITE.github],
  };

  // WebSite JSON-LD with SearchAction reserved for future site search.
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${caveat.variable}`}>
      <head>
        {/* Clash Display via Fontshare CDN. Migrate to next/font/local when
            self-hosted .woff2 files land under /public/fonts. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap"
        />
        {/* No manual `<link rel="canonical">` here on purpose.
            Next's metadata API already emits one from
            `metadata.alternates.canonical` on every route — adding a
            second one in the head produced duplicate canonical tags
            on every page, which SEO checkers flag and search engines
            ignore as ambiguous. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
