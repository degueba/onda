'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShowcasePreview } from './ShowcasePreview';
import type { ShowcaseCategory, ShowcaseMeta } from '@/lib/showcase';

// Filter pill bar + grouped masonry below. Lives as a client island so the
// gallery's `/showcase` page can stay an RSC for SEO + metadata while
// the interactive filter state lives here.
//
// Selection model: `null` means "show every category", a category key
// means "show only that section." We keep the rest of the category list
// in the bar so the user can switch without scrolling back up — selected
// pill highlights in rose, unselected stay in neutral.

export type ShowcaseGroup = {
  key: ShowcaseCategory;
  label: string;
  blurb: string;
  items: ShowcaseMeta[];
};

export function ShowcaseFilter({
  groups,
  totalCount,
}: {
  groups: ShowcaseGroup[];
  totalCount: number;
}) {
  const [selected, setSelected] = useState<ShowcaseCategory | null>(null);
  const visible = selected === null ? groups : groups.filter((g) => g.key === selected);

  return (
    <>
      {/* Filter bar — pills along the top. "All" is always first and is
          selected when nothing else is. */}
      <div className="flex flex-wrap items-center gap-2 mb-8 sm:mb-10">
        <FilterPill
          label="All"
          count={totalCount}
          active={selected === null}
          onClick={() => setSelected(null)}
        />
        {groups.map((g) => (
          <FilterPill
            key={g.key}
            label={g.label}
            count={g.items.length}
            active={selected === g.key}
            onClick={() => setSelected(g.key)}
          />
        ))}
      </div>

      {visible.map((group) => (
        <section key={group.key} className="mb-12 sm:mb-14">
          <div className="mb-4 sm:mb-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-onda-faint mb-1.5 font-mono">
              {String(group.items.length).padStart(2, '0')} · {group.key}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-onda-text">
              {group.label}
            </h2>
            <p className="text-sm text-onda-dim mt-1.5 leading-relaxed">
              {group.blurb}
            </p>
          </div>

          <div className="columns-1 sm:columns-2 gap-6 [column-fill:balance]">
            {group.items.map((s) => (
              <div key={s.slug} className="mb-6 break-inside-avoid group">
                <ShowcasePreview meta={s} />
                <Link href={`/showcase/${s.slug}`} className="block mt-3">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-onda-text group-hover:text-onda-accent transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-onda-dim mt-1 leading-snug line-clamp-2">
                    {s.description.split('—')[0].trim()}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-onda-faint mt-2 font-mono">
                    {s.width}×{s.height} · {s.duration}s · open showcase →
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
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
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
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
        className={`
          text-[10px] tabular-nums
          ${active ? 'text-onda-accent/80' : 'text-onda-faint'}
        `}
      >
        {String(count).padStart(2, '0')}
      </span>
    </button>
  );
}
