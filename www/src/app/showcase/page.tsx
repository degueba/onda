import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ShowcaseFilter } from '@/components/ShowcaseFilter';
import { showcasesByCategory, SHOWCASES } from '@/lib/showcase';
import { SITE, absoluteUrl } from '@/lib/seo';

const PAGE_TITLE = 'Showcase';
const PAGE_DESCRIPTION =
  "End-to-end compositions built entirely with Onda — marketing, broadcast, reports. Fork the source, see what's possible when 64 installable units compose into a complete short.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/showcase') },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/showcase'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
  },
};

export default function ShowcasePage() {
  // Server-side: collect the per-category groupings (cheap, sync). The
  // interactive filter + grouped layout live in the client island below.
  const groups = showcasesByCategory();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-180 mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            Showcase
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Made with Onda
          </h1>
          <p className="text-onda-dim mt-3 max-w-80 leading-relaxed">
            End-to-end compositions, each built entirely from{' '}
            <Link href="/components" className="text-onda-text underline decoration-onda-border-lit underline-offset-[3px] hover:decoration-onda-accent transition-colors">
              the catalog
            </Link>
            . Fork the source, swap the copy, ship.
          </p>
        </header>

        <ShowcaseFilter groups={[...groups]} totalCount={SHOWCASES.length} />

        <p className="text-xs uppercase tracking-[0.16em] text-onda-faint font-mono mt-12">
          {SHOWCASES.length} showcases · all source-available
        </p>
      </main>

      <Footer />
    </div>
  );
}
