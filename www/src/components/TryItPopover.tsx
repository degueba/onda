'use client';

import { SlidersHorizontal, X } from '@phosphor-icons/react';
import { useState } from 'react';
import type { ZodTypeAny } from 'zod';
import { PropsControls } from './PropsControls';

type Props = {
  schema: ZodTypeAny;
  values: Record<string, unknown>;
  defaults: Record<string, unknown>;
  /** Curated "known good" preset configurations. Rendered as a chip row
   *  at the top of the drawer. */
  presets?: Record<string, Record<string, unknown>>;
  onChange: (next: Record<string, unknown>) => void;
};

// "Try it" trigger + side sheet drawer.
//
// The drawer slides in from the RIGHT EDGE OF THE VIEWPORT (not the
// preview card) — full viewport height, fixed width on desktop, 90vw
// max on mobile. No backdrop: clicking anywhere else on the page (the
// preview, other UI) keeps the drawer open and stays interactive. Only
// the explicit X button closes it.
//
// This lets users scrub a slider in the drawer and watch the preview
// canvas update in real time without the drawer ever covering or
// blocking the canvas.
//
// Implemented as a stateful sibling pair (button + fixed div) instead of
// Radix popover/dialog so we keep full control over the no-backdrop,
// no-focus-trap, no-auto-close behavior. The drawer is always in the
// DOM — just transformed off-screen when closed — so the slide
// animation runs cleanly in both directions.
export function TryItPopover({ schema, values, defaults, presets, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close props controls' : 'Open props controls'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`
          absolute top-3 right-3 z-20
          inline-flex items-center gap-1.5
          px-2.5 py-1.5 rounded-md
          bg-onda-surface/70 backdrop-blur-md
          border border-onda-border-lit
          text-onda-text
          text-[11px] uppercase tracking-wider font-medium
          shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]
          transition-all duration-200 ease-out
          hover:bg-onda-surface hover:scale-105 hover:border-onda-text/40
          active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-onda-accent/40
          ${open ? 'bg-onda-surface border-onda-text/40' : ''}
        `}
      >
        <SlidersHorizontal size={12} weight="bold" />
        Try it
      </button>

      {/*
        The drawer itself. `fixed` to the viewport, anchored to the right
        edge, full height. Slides in via translateX. `aria-hidden` and
        `pointer-events-none` on the closed state so the drawer can't
        intercept clicks that go to the page below.
      */}
      <aside
        role="dialog"
        aria-label="Props controls"
        aria-hidden={!open}
        className={`
          fixed top-0 right-0 z-40
          h-screen w-80 max-w-[90vw]
          bg-onda-surface/95 backdrop-blur-lg
          border-l border-onda-border-lit
          shadow-[0_0_60px_-20px_rgba(0,0,0,0.7)]
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* Drawer header — title + close button. Mirrors the existing
            Try-it header style for consistency. */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-onda-border">
          <div className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
            Try it
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="text-onda-faint hover:text-onda-text transition-colors p-1 rounded-md"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Scrollable controls body. Overscroll-contain so scrolling the
            drawer doesn't accidentally scroll the underlying page. */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <PropsControls
            schema={schema}
            values={values}
            defaults={defaults}
            presets={presets}
            onChange={onChange}
            bare
          />
        </div>
      </aside>
    </>
  );
}
