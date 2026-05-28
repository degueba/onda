// Twitter/X uses its own image meta tag instead of falling back to og:image
// for the summary_large_image card. We point it at the same renderer the
// homepage opengraph-image uses so there's exactly one source of truth.
//
// Why we can't just `export * from './opengraph-image'`: Next 15 reads
// route-segment config (runtime, size, contentType, alt) by static
// analysis and explicitly does not follow re-exports — re-exporting
// triggers a build warning and silently falls back to defaults. So we
// re-declare the statics here and only forward the default render.

import OpengraphImage from './opengraph-image';
import { SITE } from '@/lib/seo';

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default OpengraphImage;
