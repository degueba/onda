'use client';

import { useMemo, useState } from 'react';
import { ComponentPreview } from './ComponentPreview';
import { TryItPopover } from './TryItPopover';
import { COMPONENT_REGISTRY } from './componentRegistry';

type LivePreviewProps = {
  slug: string;
  propsOverride?: Record<string, unknown>;
  durationInFrames?: number;
  /** When true, render the interactive props panel below the player. */
  controls?: boolean;
};

export function LivePreview({
  slug,
  propsOverride,
  durationInFrames = 120,
  controls = false,
}: LivePreviewProps) {
  const entry = COMPONENT_REGISTRY[slug];

  // Schema-derived defaults + per-slug registry override + per-mount
  // override. Layered so the most specific source wins. Memoized so the
  // useState initializer sees a stable reference and the controls' Reset
  // button returns to a known good state.
  const defaults = useMemo(() => {
    if (!entry) return {} as Record<string, unknown>;
    const base = entry.schema.parse({}) as Record<string, unknown>;
    return { ...base, ...(entry.defaultPropsOverride ?? {}), ...propsOverride };
  }, [entry, propsOverride]);

  const [values, setValues] = useState<Record<string, unknown>>(defaults);

  if (!entry) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]">
      <ComponentPreview
        component={entry.component}
        inputProps={values as never}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
      />
      {controls && (
        <TryItPopover
          schema={entry.schema}
          values={values}
          defaults={defaults}
          presets={entry.presets}
          onChange={setValues}
        />
      )}
    </div>
  );
}
