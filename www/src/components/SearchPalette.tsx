'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/** Search-row shape — the minimum each component contributes to the index. */
export type SearchItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

type Scored = SearchItem & { score: number };

// Field weights — higher means a match in that field outranks the others.
// Name + title are how people look up a component; tags are a secondary
// retrieval signal; description is the fallback for full-text intent.
const WEIGHT_SLUG_EXACT = 100;
const WEIGHT_SLUG_PREFIX = 80;
const WEIGHT_TITLE_PREFIX = 70;
const WEIGHT_SLUG_CONTAINS = 60;
const WEIGHT_TITLE_CONTAINS = 50;
const WEIGHT_TAG_CONTAINS = 35;
const WEIGHT_CATEGORY_CONTAINS = 25;
const WEIGHT_DESCRIPTION_CONTAINS = 15;

/** Score a single item against a lowercase query. Returns `0` if no match. */
function scoreItem(item: SearchItem, q: string): number {
  if (!q) return 0;

  const slug = item.slug.toLowerCase();
  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const category = item.category.toLowerCase();
  const tagsLower = item.tags.map((t) => t.toLowerCase());

  let s = 0;
  if (slug === q) s += WEIGHT_SLUG_EXACT;
  if (slug.startsWith(q)) s += WEIGHT_SLUG_PREFIX;
  if (slug.includes(q)) s += WEIGHT_SLUG_CONTAINS;
  if (title.startsWith(q)) s += WEIGHT_TITLE_PREFIX;
  if (title.includes(q)) s += WEIGHT_TITLE_CONTAINS;
  if (tagsLower.some((t) => t.includes(q))) s += WEIGHT_TAG_CONTAINS;
  if (category.includes(q)) s += WEIGHT_CATEGORY_CONTAINS;
  if (description.includes(q)) s += WEIGHT_DESCRIPTION_CONTAINS;
  return s;
}

/** Rank items by score; tie-break alphabetically on slug for stability. */
function rank(items: SearchItem[], query: string): Scored[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items.map((i) => ({ ...i, score: 0 }));
  }
  return items
    .map((i) => ({ ...i, score: scoreItem(i, q) }))
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}

/**
 * The ⌘K search palette. Trigger renders inline in the nav; the palette
 * itself uses the native HTML `<dialog>` element so we get focus-trap,
 * Esc-to-close, and ::backdrop styling without a dependency.
 */
export function SearchPalette({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => rank(items, query), [items, query]);

  // Reset selection when results change so the highlight doesn't point past
  // the new list's end.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const open = useCallback(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (!dlg.open) dlg.showModal();
    // Defer focus until after showModal mounts the dialog into the top layer.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const close = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    dialogRef.current?.close();
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      close();
      router.push(`/components/${slug}`);
    },
    [close, router],
  );

  // Global keyboard: ⌘K / Ctrl+K to open, "/" outside an input to open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      const isSlash = e.key === '/' && !inField;

      if (isModK || isSlash) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Dialog-level keyboard: ↑ / ↓ to move highlight, Enter to navigate.
  // Bound here (not on the input) so the same handler covers both the input
  // and any subsequent focus stop inside the panel.
  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = results[activeIndex];
      if (pick) navigate(pick.slug);
    }
  };

  // Click on the backdrop (outside the inner card) should close. The dialog
  // element's own click target IS the backdrop when the user clicks past the
  // inner content — so guard with currentTarget === target.
  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search components"
        className="
          inline-flex items-center gap-2
          h-7 px-2 rounded-md
          bg-onda-surface border border-onda-border
          text-onda-faint hover:text-onda-text hover:border-onda-border-lit
          transition-colors
          text-xs
        "
      >
        <MagnifyingGlass size={12} weight="bold" />
        <span className="hidden sm:inline">Search</span>
        <kbd
          className="
            hidden sm:inline-flex items-center
            font-mono text-[10px] text-onda-faint
            border border-onda-border rounded
            px-1 py-0
            ml-1
          "
        >
          ⌘K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        onClick={onBackdropClick}
        onClose={() => {
          setQuery('');
          setActiveIndex(0);
        }}
        className="onda-search-dialog"
      >
        <div
          onKeyDown={onPanelKeyDown}
          className="
            w-[min(640px,calc(100vw-2rem))]
            bg-onda-surface border border-onda-border-lit
            rounded-2xl
            shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]
            overflow-hidden
          "
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-onda-border">
            <MagnifyingGlass size={14} weight="bold" className="text-onda-faint" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components by name, tag, or description…"
              className="
                flex-1 bg-transparent border-none outline-none
                text-sm text-onda-text placeholder:text-onda-faint
                py-1
              "
            />
            <kbd className="font-mono text-[10px] text-onda-faint border border-onda-border rounded px-1.5 py-0.5">
              esc
            </kbd>
          </div>

          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-onda-faint">
                No matches.
              </li>
            )}
            {results.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => navigate(item.slug)}
                    className={`
                      w-full text-left px-3 py-2
                      flex items-baseline gap-3
                      transition-colors
                      ${
                        isActive
                          ? 'bg-onda-surface-2 text-onda-text'
                          : 'text-onda-dim hover:bg-onda-surface-2/60'
                      }
                    `}
                  >
                    <span className="font-display text-sm font-semibold text-onda-text">
                      {item.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-onda-faint">
                      {item.category}
                    </span>
                    <span className="text-xs text-onda-dim line-clamp-1 flex-1 min-w-0">
                      {item.description}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </dialog>
    </>
  );
}
