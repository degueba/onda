import Link from 'next/link';
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { DOCS_NAV } from '@/lib/docs-nav';

// Mobile/tablet replacement for the desktop docs sidebar. Visible only
// below md (768px), collapsed by default into a single tap-row so the
// article gets full width. Uses a native <details>/<summary> — keyboard
// + screen-reader accessible with no JS — and matches the mobile menu
// pattern already used in the top nav.

export function DocsMobileNav() {
  return (
    <details className="md:hidden mb-6 group">
      <summary
        className="
          list-none cursor-pointer
          flex items-center justify-between
          px-4 py-3
          bg-onda-surface border border-onda-border rounded-xl
          font-mono text-xs uppercase tracking-[0.12em] text-onda-dim
          hover:text-onda-text hover:border-onda-border-lit
          transition-colors
          [&::-webkit-details-marker]:hidden
        "
      >
        <span>Documentation</span>
        <CaretDown
          size={12}
          weight="bold"
          className="text-onda-faint group-open:rotate-180 transition-transform"
        />
      </summary>

      <div className="mt-2 px-4 py-3 bg-onda-surface border border-onda-border rounded-xl">
        <ul className="space-y-5">
          {DOCS_NAV.map((group) => (
            <li key={group.label}>
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-onda-faint mb-2 font-mono">
                {group.label}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-1 text-sm text-onda-dim hover:text-onda-text transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
