import Link from 'next/link';
import { List } from '@phosphor-icons/react/dist/ssr';
import { listComponents } from '@/lib/registry';
import { SearchPalette, type SearchItem } from './SearchPalette';
import { BrandLogo } from './logo/BrandLogo';

/**
 * Top nav — server component. Loads the catalog at build time and hands the
 * minimum searchable subset to the client-side {@link SearchPalette}.
 *
 * Keeping the catalog read here (rather than in a layout) means the search
 * index travels with every page that renders the nav, and individual page
 * components stay free of search-related plumbing.
 *
 * Mobile vs desktop: at `< sm` the catalog links collapse into a native
 * `<details>` hamburger; at `sm` and up the full row renders inline. The
 * details element lets us avoid converting Nav to a client component for
 * this — `<summary>` toggles the menu without JS and is accessible by
 * default (keyboard + screen reader).
 */
export function Nav() {
  const searchItems: SearchItem[] = listComponents().map((c) => ({
    slug: c.name,
    title: c.title,
    description: c.description,
    category: c.category,
    tags: c.tags,
  }));

  // Single source of truth for the catalog links — rendered twice (once
  // inline for desktop, once inside the mobile <details>) so the lists
  // never drift.
  const links = [
    { href: '/components', label: 'Components' },
    { href: '/showcase', label: 'Showcase' },
    { href: '/docs', label: 'Docs' },
    { href: '/compare', label: 'Compare' },
  ];

  return (
    <nav className="w-full border-b border-onda-border">
      <div className="max-w-150 mx-auto px-3 sm:px-4 h-8 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity"
          aria-label="Onda — home"
        >
          {/* Mark + wordmark. animate=false so the mark sits static once a
              visitor has landed — the entry animation reads as a "this just
              loaded" moment and shouldn't replay on every nav. The first
              page paint (home / catalog) gets a fresh animation; subsequent
              client-side route changes preserve the BrandLogo, so the wave
              stays settled. */}
          <BrandLogo height={20} animate={false} />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <SearchPalette items={searchItems} />

          {/* Desktop: inline catalog links. Hidden on < sm. */}
          <div className="hidden sm:flex items-center gap-3 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-onda-dim hover:text-onda-text transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/degueba/onda"
              target="_blank"
              rel="noreferrer"
              className="text-onda-dim hover:text-onda-text transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Mobile: hamburger that opens a small panel below the nav.
              Uses native <details>/<summary> so the toggle works with no
              client JS. The :open arrow rotation is purely cosmetic. */}
          <details className="relative sm:hidden">
            <summary
              className="
                list-none cursor-pointer inline-flex items-center justify-center
                w-7 h-7 rounded-md border border-onda-border
                text-onda-dim hover:text-onda-text hover:border-onda-border-lit
                transition-colors
                [&::-webkit-details-marker]:hidden
              "
              aria-label="Open menu"
            >
              <List size={14} weight="bold" />
            </summary>
            {/* Absolute-positioned dropdown anchored to the summary. Right-
                aligned so it doesn't run off the screen on narrow viewports.
                Surface vocabulary mirrors the popover / search-palette to
                stay coherent. */}
            <div
              className="
                absolute right-0 top-full mt-2 z-50
                min-w-36
                bg-onda-surface border border-onda-border-lit rounded-xl
                shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]
                py-2
                text-sm
              "
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-4 py-2 text-onda-dim hover:text-onda-text hover:bg-onda-surface-2 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="https://github.com/degueba/onda"
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-2 text-onda-dim hover:text-onda-text hover:bg-onda-surface-2 transition-colors"
              >
                GitHub
              </a>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
