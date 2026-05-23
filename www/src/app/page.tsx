import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CopyButton } from '@/components/CopyButton';
import { SITE, absoluteUrl } from '@/lib/seo';

const INSTALL_LINE = 'npx onda add blur-reveal';

// Home page wants the brand name as its full title (no template suffix),
// so we set `title` to a literal string rather than letting the layout
// template produce "Home — Onda".
export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: absoluteUrl('/'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 flex flex-col items-center px-3 sm:px-4">
        {/* Hero — the signature motion, large and quiet */}
        <section className="onda-rise onda-rise-1 w-full max-w-150 mt-8 sm:mt-10">
          <Hero />
        </section>

        {/* Tagline */}
        <section className="onda-rise onda-rise-2 max-w-80 mt-6 sm:mt-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-onda-text">
            Code-first motion graphics.
            <br />
            <span className="text-onda-dim">Installed as source. Owned by you.</span>
          </h1>
        </section>

        {/* Install snippet — the single accent of the section lives on the
            copy affordance label state, not on the line itself */}
        <section className="onda-rise onda-rise-3 w-full max-w-65 mt-6 sm:mt-8 bg-onda-surface border border-onda-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <code className="font-mono text-sm text-onda-text overflow-x-auto whitespace-nowrap">
            <span className="text-onda-faint">$</span> {INSTALL_LINE}
          </code>
          <CopyButton text={INSTALL_LINE} />
        </section>

        {/* Provenance eyebrow — the spec details that don't need to crowd the
            hook. Library positioning today, AI-agent line hints at the
            audience without overclaiming. */}
        <p className="onda-rise onda-rise-4 text-[10px] sm:text-xs uppercase tracking-[0.16em] text-onda-faint mt-3">
          Built on Remotion · For developers and AI agents
        </p>

        {/* Why-Onda — three sentences, restrained, one accent word */}
        <section className="onda-rise onda-rise-5 max-w-80 mt-10 sm:mt-12 text-center">
          <p className="text-onda-dim leading-relaxed text-base sm:text-lg">
            Onda's edge is a{' '}
            <span className="text-onda-accent">signature motion identity</span> —
            a recognizable way everything moves, applied across ordinary
            components. Apple-discipline restraint with a premium-dark surface,
            so the result is unmistakable by feel before any logo appears.
          </p>
        </section>

        {/* CTAs */}
        <section className="onda-rise onda-rise-6 mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/components"
            className="px-4 py-2 rounded-lg bg-onda-text text-onda-bg font-medium hover:opacity-90 transition-opacity"
          >
            Browse components →
          </Link>
          <a
            href="https://github.com/botelhodeveloper/onda"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg border border-onda-border-lit text-onda-text font-medium hover:bg-onda-surface transition-colors"
          >
            GitHub
          </a>
        </section>

        <div className="h-10 sm:h-16" />
      </main>

      <Footer />
    </div>
  );
}
