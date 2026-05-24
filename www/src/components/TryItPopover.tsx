'use client';

import * as Popover from '@radix-ui/react-popover';
import { SlidersHorizontal, X } from '@phosphor-icons/react';
import type { ZodTypeAny } from 'zod';
import { PropsControls } from './PropsControls';

type Props = {
  schema: ZodTypeAny;
  values: Record<string, unknown>;
  defaults: Record<string, unknown>;
  /** Curated "known good" preset configurations. Rendered as a chip row
   *  at the top of the popover. Each preset is a `Partial<Props>` merged
   *  into the current values when clicked. */
  presets?: Record<string, Record<string, unknown>>;
  onChange: (next: Record<string, unknown>) => void;
};

// "Try it" trigger + side drawer. Anchored to the right edge of the
// preview card so the drawer opens BESIDE the preview (not over it) —
// users can scrub controls and watch the visualization change at the
// same time. The drawer does NOT trap focus or close on outside click,
// so interactions with the rest of the page (or another preview) stay
// live while it's open.
//
// On narrow viewports where there's no room to the right, Radix flips
// the drawer below the trigger automatically (collisionPadding +
// avoidCollisions defaults).
export function TryItPopover({ schema, values, defaults, presets, onChange }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Open props controls"
          className="
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
            data-[state=open]:bg-onda-surface data-[state=open]:border-onda-text/40
          "
        >
          <SlidersHorizontal size={12} weight="bold" />
          Try it
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          // `side="right"` opens the drawer to the right of the preview.
          // `align="start"` aligns the drawer's top edge with the trigger.
          // Combined: drawer appears beside the preview, top edges aligned —
          // no overlap with the preview area itself.
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          // Don't auto-close when the user clicks the preview (so they can
          // scrub the slider and immediately interact with the canvas).
          // Don't trap focus — the rest of the page stays usable.
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="onda-popover-content z-50 w-56 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden overscroll-contain"
        >
          <div className="relative">
            <Popover.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute top-2.5 right-2.5 text-onda-faint hover:text-onda-text transition-colors p-1 rounded-md z-10"
              >
                <X size={14} weight="bold" />
              </button>
            </Popover.Close>

            <PropsControls
              schema={schema}
              values={values}
              defaults={defaults}
              presets={presets}
              onChange={onChange}
              bare
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
