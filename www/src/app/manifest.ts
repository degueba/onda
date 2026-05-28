import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

// Web app manifest — served at /manifest.webmanifest by Next's app-router
// metadata convention. Browsers use this for "Add to home screen", richer
// install prompts, and as a signal that the site is a polished destination.
//
// We are not building a PWA (no service worker, no offline shell), so this
// is intentionally minimal — name, icons, theme colors, brand info — just
// enough to make share targets and install dialogs render with the right
// identity instead of falling back to a generic chrome icon.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'browser',
    background_color: '#08080A',
    theme_color: '#08080A',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
