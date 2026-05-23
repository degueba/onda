'use client';

import * as Popover from '@radix-ui/react-popover';
import { SlidersHorizontal, X } from '@phosphor-icons/react';
import type { ZodTypeAny } from 'zod';
import { PropsControls } from './PropsControls';

type Props = {
  schema: ZodTypeAny;
  values: Record<string, unknown>;
  defaults: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

// "Try it" trigger + popover. Anchored absolutely to the bottom-right of the
// preview card. Click → opens a floating panel with the schema-driven knobs;
// preview stays visible underneath / behind it.
export function TryItPopover({ schema, values, defaults, onChange }: Props) {
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
          side="bottom"
          align="end"
          sideOffset={10}
          collisionPadding={16}
          avoidCollisions={false}
          className="onda-popover-content z-50 w-42.5 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
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
              onChange={onChange}
              bare
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
