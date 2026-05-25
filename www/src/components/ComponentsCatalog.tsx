'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CaretUp, Funnel, MagnifyingGlass, X } from '@phosphor-icons/react';
import { CatalogPreview } from './CatalogPreview';

// Client island for the components catalog: a sticky filter bar (search
// + category chips) over a thumbnail grid. The server page (an RSC) does
// the FS read + grouping and hands trimmed data down here so the
// interactive state can live client-side.
//
// State model: `cat` (category id or null) and `q` (search query) are
// mirrored into URL search params so deep links and back-button restore
// the view. When `q` is non-empty we show a flat ranked list across all
// categories; otherwise we show grouped sections, optionally filtered to
// a single category by `cat`.
//
// Typography intent: Clash Display (`font-display`) is reserved for the
// component names — the page's actual headlines. Section labels, eyebrows,
// chips, and the search input lean on Space Grotesk (`font-mono` / body)
// so the page has real hierarchy and rhythm without leaning on the
// display face for every line.

export type CatalogItem = {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export type CatalogGroup = {
  id: string;
  label: string;
  blurb: string;
  items: CatalogItem[];
};

export function ComponentsCatalog({
  groups,
  total,
}: {
  groups: CatalogGroup[];
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');
  const qParam = searchParams.get('q') ?? '';

  // Local input value tracks the input element directly so typing is
  // responsive; the URL is updated on a short debounce so we don't push a
  // new history entry per keystroke.
  const [query, setQuery] = useState(qParam);
  useEffect(() => {
    // Keep local input in sync if the user navigates with back/forward.
    setQuery(qParam);
  }, [qParam]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Collapsed = filter bar hidden, only a tiny pill at top-right brings
  // it back. For users who want every pixel for the grid. Session-only
  // (intentionally not persisted) so a fresh visit always shows the
  // full bar; otherwise a first-time visitor lands on a stranger's
  // collapsed state.
  const [collapsed, setCollapsed] = useState(false);
  const hasActiveFilter = catParam !== null || qParam !== '';

  // `/` to focus search from anywhere on the page. Skip when typing in
  // another input so the shortcut never hijacks normal text entry.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Update URL without scrolling. Debounced for typing, immediate for
  // category clicks.
  const setUrlParams = useCallback(
    (next: { cat?: string | null; q?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.cat !== undefined) {
        if (next.cat === null || next.cat === '') params.delete('cat');
        else params.set('cat', next.cat);
      }
      if (next.q !== undefined) {
        if (next.q === null || next.q === '') params.delete('q');
        else params.set('q', next.q);
      }
      const qs = params.toString();
      router.replace(qs ? `/components?${qs}` : '/components', { scroll: false });
    },
    [router, searchParams],
  );

  // Debounce query → URL writes. 200ms feels responsive without spamming
  // the history stack.
  useEffect(() => {
    if (query === qParam) return;
    const t = setTimeout(() => setUrlParams({ q: query }), 200);
    return () => clearTimeout(t);
  }, [query, qParam, setUrlParams]);

  const trimmed = query.trim().toLowerCase();
  const searching = trimmed.length > 0;

  // Flat searchable index — built once from all groups, regardless of the
  // current category filter, so search always feels global.
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const searchResults = useMemo(() => {
    if (!searching) return [] as CatalogItem[];
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    // Rank: title match > name match > tag match > description match.
    // Every token must match somewhere; rank is the sum across tokens of
    // the best field hit. Lower rank == better.
    const score = (item: CatalogItem): number | null => {
      let total = 0;
      for (const tok of tokens) {
        const title = item.title.toLowerCase();
        const name = item.name.toLowerCase();
        const tags = item.tags.join(' ').toLowerCase();
        const desc = item.description.toLowerCase();
        let best: number | null = null;
        if (title.includes(tok)) best = title.startsWith(tok) ? 0 : 1;
        else if (name.includes(tok)) best = 2;
        else if (tags.includes(tok)) best = 3;
        else if (desc.includes(tok)) best = 4;
        if (best === null) return null;
        total += best;
      }
      return total;
    };
    return allItems
      .map((item) => ({ item, s: score(item) }))
      .filter((x): x is { item: CatalogItem; s: number } => x.s !== null)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.item);
  }, [allItems, trimmed, searching]);

  // Category view: either every group, or just the selected one.
  const visibleGroups = catParam === null
    ? groups
    : groups.filter((g) => g.id === catParam);

  return (
    <>
      {collapsed ? (
        /* Collapsed: tiny pill sticky at top-right. Shows a hint of the
           active filter (category or search) so the user knows the
           grid isn't the full catalog even when the bar is hidden. */
        <div className="sticky top-0 z-30 h-0 mb-6 sm:mb-8">
          <div className="absolute right-0 top-2 flex">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Show filters"
              aria-expanded={false}
              className="
                inline-flex items-center gap-2 h-8 pl-3 pr-3 rounded-full
                bg-onda-surface/85 backdrop-blur-md border border-onda-border
                font-mono text-[11px] uppercase tracking-[0.12em] text-onda-dim
                hover:text-onda-text hover:border-onda-border-lit
                transition-colors
                shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]
              "
            >
              <Funnel size={12} weight="regular" />
              <span>Filters</span>
              {hasActiveFilter && (
                <span
                  aria-label="filter active"
                  className="h-1.5 w-1.5 rounded-full bg-onda-accent"
                />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Sticky filter bar. The Nav isn't sticky — it scrolls away with
           the page — so this docks at `top-0` to sit flush with the
           viewport edge once the nav is gone. Backdrop blur keeps the
           content underneath legible without an opaque slab. Asymmetric
           padding: tighter on top, slightly looser on the bottom so the
           chip row has breathing room above the grid. */
        <div className="sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 pt-2 pb-2.5 mb-6 sm:mb-8 bg-onda-bg/85 backdrop-blur-md border-b border-onda-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlass
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-onda-faint pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setQuery('');
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Search components — fade, code, gradient…"
                aria-label="Search components"
                className="
                  w-full h-9 pl-8 pr-9 rounded-full
                  bg-onda-surface border border-onda-border
                  font-mono text-xs text-onda-text placeholder:text-onda-faint
                  focus:outline-none focus:border-onda-border-lit
                  focus-visible:ring-2 focus-visible:ring-onda-accent/40
                  transition-colors
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-full text-onda-faint hover:text-onda-text hover:bg-onda-surface-2 transition-colors"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
            <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-1.5 rounded border border-onda-border bg-onda-surface font-mono text-[10px] text-onda-faint">
              /
            </kbd>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Hide filters"
              aria-expanded={true}
              title="Hide filters"
              className="
                inline-flex items-center justify-center h-7 w-7 rounded-full
                border border-onda-border text-onda-faint
                hover:text-onda-text hover:border-onda-border-lit hover:bg-onda-surface
                focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40
                transition-colors
              "
            >
              <CaretUp size={12} weight="bold" />
            </button>
          </div>

          {/* Category chips — "All" first, then one per non-empty
              category. Horizontal scroll on overflow keeps the bar a
              single row at every viewport size. */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-none">
            <FilterPill
              label="All"
              count={total}
              active={catParam === null}
              onClick={() => setUrlParams({ cat: null })}
            />
            {groups.map((g) => (
              <FilterPill
                key={g.id}
                label={g.label}
                count={g.items.length}
                active={catParam === g.id}
                onClick={() => setUrlParams({ cat: g.id })}
              />
            ))}
          </div>
        </div>
      )}

      {searching ? (
        <SearchResults results={searchResults} query={query} />
      ) : (
        <div className="flex flex-col gap-10 sm:gap-14">
          {visibleGroups.map((group) => (
            <CategorySection key={group.id} group={group} />
          ))}
        </div>
      )}
    </>
  );
}

function CategorySection({ group }: { group: CatalogGroup }) {
  return (
    <section>
      <div className="mb-4 sm:mb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-onda-faint mb-1.5">
          {String(group.items.length).padStart(2, '0')} · {group.id}
        </p>
        {/* Space Grotesk (not Clash) — section labels are structure, the
            card titles below are the headlines. */}
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
          {group.label}
        </h2>
        <p className="text-sm text-onda-dim mt-1 max-w-xl leading-relaxed">
          {group.blurb}
        </p>
      </div>

      <CardGrid items={group.items} />
    </section>
  );
}

function SearchResults({ results, query }: { results: CatalogItem[]; query: string }) {
  return (
    <section>
      <div className="mb-4 sm:mb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-onda-faint mb-1.5">
          {String(results.length).padStart(2, '0')} · results
        </p>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
          {results.length === 0
            ? `Nothing matches “${query.trim()}”`
            : `Matching “${query.trim()}”`}
        </h2>
        {results.length === 0 && (
          <p className="text-sm text-onda-dim mt-1 max-w-xl leading-relaxed">
            Try a different keyword — component name, tag, or a word from the description.
          </p>
        )}
      </div>
      {results.length > 0 && <CardGrid items={results} showCategory />}
    </section>
  );
}

function CardGrid({ items, showCategory = false }: { items: CatalogItem[]; showCategory?: boolean }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((c) => (
        <li key={c.name}>
          <Link
            href={`/components/${c.name}`}
            className="block group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40"
          >
            <CatalogPreview slug={c.name} title={c.title} />
            <div className="pt-3 px-1">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold tracking-tight text-onda-text group-hover:text-onda-accent transition-colors">
                  {c.title}
                </h3>
                {showCategory && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-onda-faint shrink-0">
                    {c.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-onda-dim mt-1 line-clamp-1">
                {c.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        border text-xs font-mono uppercase tracking-[0.12em]
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40
        ${
          active
            ? 'bg-onda-accent/10 border-onda-accent/50 text-onda-accent'
            : 'bg-transparent border-onda-border text-onda-dim hover:border-onda-border-lit hover:text-onda-text'
        }
      `}
    >
      <span>{label}</span>
      <span
        className={`text-[10px] tabular-nums ${active ? 'text-onda-accent/80' : 'text-onda-faint'}`}
      >
        {String(count).padStart(2, '0')}
      </span>
    </button>
  );
}
