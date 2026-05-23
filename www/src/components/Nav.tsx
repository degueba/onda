import Link from 'next/link';
import { listComponents } from '@/lib/registry';
import { SearchPalette, type SearchItem } from './SearchPalette';

/**
 * Top nav — server component. Loads the catalog at build time and hands the
 * minimum searchable subset to the client-side {@link SearchPalette}.
 *
 * Keeping the catalog read here (rather than in a layout) means the search
 * index travels with every page that renders the nav, and individual page
 * components stay free of search-related plumbing.
 */
export function Nav() {
  const searchItems: SearchItem[] = listComponents().map((c) => ({
    slug: c.name,
    title: c.title,
    description: c.description,
    category: c.category,
    tags: c.tags,
  }));

  return (
    <nav className="w-full border-b border-onda-border">
      <div className="max-w-150 mx-auto px-3 sm:px-4 h-8 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-onda-text hover:opacity-80 transition-opacity"
        >
          Onda
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <SearchPalette items={searchItems} />
          <Link
            href="/components"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            Components
          </Link>
          <Link
            href="/docs"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/compare"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            Compare
          </Link>
          <a
            href="https://github.com/degueba/onda"
            target="_blank"
            rel="noreferrer"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
