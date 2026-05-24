'use client';

import { ArrowCounterClockwise, Plus, X } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z, type ZodTypeAny } from 'zod';

type PropsControlsProps = {
  schema: ZodTypeAny;
  values: Record<string, unknown>;
  defaults: Record<string, unknown>;
  /** Curated named configurations. Rendered as a chip row above the
   *  sliders — one click applies the preset by merging it into values. */
  presets?: Record<string, Record<string, unknown>>;
  onChange: (next: Record<string, unknown>) => void;
  /** Skip the outer card styling and enter animation — use when the parent
   * (e.g. a popover) already provides a surface. */
  bare?: boolean;
};

// Hints for known numeric props by name. Anything not listed falls back to a
// plain number input. Add entries as new primitives introduce new numerics.
const NUMERIC_HINTS: Record<
  string,
  { min: number; max: number; step: number }
> = {
  delay: { min: 0, max: 60, step: 1 },
  duration: { min: 1, max: 90, step: 1 },
  fontSize: { min: 12, max: 320, step: 1 },
  distance: { min: 0, max: 64, step: 1 },
  stagger: { min: 0, max: 20, step: 1 },
  fromScale: { min: 0.7, max: 1, step: 0.01 },
  strokeWidth: { min: 0.5, max: 20, step: 0.5 },
  width: { min: 100, max: 2000, step: 50 },
  height: { min: 100, max: 2000, step: 50 },
  decimals: { min: 0, max: 4, step: 1 },
  baseFrequency: { min: 0.1, max: 2, step: 0.05 },
  numOctaves: { min: 1, max: 4, step: 1 },
  seed: { min: 0, max: 99, step: 1 },
  fromAngle: { min: -45, max: 45, step: 1 },
};

const COLOR_PROP_NAMES = new Set([
  'color',
  'stroke',
  'fill',
  'background',
  'backgroundColor',
]);

// Curated dropdown options for known string props. When a field name lands
// here, render a Select instead of a free-text input so the user can see the
// supported values at a glance. Custom values are still possible in code.
const STRING_OPTIONS: Record<string, { label: string; value: string }[]> = {
  fontFamily: [
    { label: 'Clash Display', value: '"Clash Display", sans-serif' },
    { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Monospace', value: 'monospace' },
  ],
};

// Format a preset's camelCase / kebab-case key as a human-readable label.
// `voiceRibbon` → "Voice ribbon"; `neon-ring` → "Neon ring".
function presetLabel(key: string): string {
  const spaced = key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Deep-equality helper for spotting which preset is currently active.
// Handles primitives, arrays, and plain objects — enough for the prop
// types schemas declare. Not a general deepEqual.
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

// Walk through ZodDefault / ZodOptional / ZodNullable wrappers to find the
// real type underneath. Zod stores wrapped types under `_def.innerType`.
function unwrap(field: ZodTypeAny): { type: string; field: ZodTypeAny } {
  const def = (field as unknown as { _def: { typeName: string; innerType?: ZodTypeAny } })._def;
  if (
    def.typeName === 'ZodDefault' ||
    def.typeName === 'ZodOptional' ||
    def.typeName === 'ZodNullable'
  ) {
    return unwrap(def.innerType!);
  }
  return { type: def.typeName, field };
}

export function PropsControls({
  schema,
  values,
  defaults,
  presets,
  onChange,
  bare = false,
}: PropsControlsProps) {
  const reset = useCallback(() => onChange(defaults), [defaults, onChange]);

  // Apply a preset by merging its partial props onto the SCHEMA DEFAULTS
  // (not the current `values`). Important: if a previous preset set
  // `waveLines: 4` and the new preset doesn't mention `waveLines`, the
  // new preset's "intended" look would inherit `waveLines: 4` from the
  // stale current state — wrong. Re-deriving from defaults guarantees
  // each preset renders in isolation.
  const applyPreset = useCallback(
    (preset: Record<string, unknown>) => onChange({ ...defaults, ...preset }),
    [defaults, onChange],
  );

  if (!(schema instanceof z.ZodObject)) return null;
  const shape = schema.shape as Record<string, ZodTypeAny>;

  const setField = (name: string, value: unknown) =>
    onChange({ ...values, [name]: value });

  const wrapperClass = bare
    ? 'p-3 sm:p-4'
    : 'onda-rise bg-onda-surface/60 backdrop-blur-sm border border-onda-border rounded-2xl p-3 sm:p-4';

  // Detect the active preset by deep-equality of its prop subset against
  // current values. Used to highlight the active chip. A preset is "active"
  // if every prop it sets matches the current value.
  const activePreset = presets
    ? Object.entries(presets).find(([, preset]) =>
        Object.entries(preset).every(([k, v]) => deepEqual(values[k], v)),
      )?.[0]
    : undefined;

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.16em] text-onda-faint">
          Try it
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] uppercase tracking-[0.16em] text-onda-faint hover:text-onda-text transition-colors flex items-center gap-1 px-2 py-1 rounded-md"
        >
          <ArrowCounterClockwise size={12} weight="bold" />
          Reset
        </button>
      </div>

      {presets && Object.keys(presets).length > 0 && (
        <div className="mb-3 pb-3 border-b border-onda-border">
          <div className="text-[10px] uppercase tracking-[0.16em] text-onda-faint mb-1.5">
            Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(presets).map(([name, preset]) => {
              const isActive = activePreset === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={
                    isActive
                      ? 'text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-1 rounded-md border bg-onda-accent/15 border-onda-accent/50 text-onda-text transition-colors'
                      : 'text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-1 rounded-md border bg-onda-bg/40 border-onda-border text-onda-dim hover:text-onda-text hover:border-onda-border-lit transition-colors'
                  }
                >
                  {presetLabel(name)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {Object.entries(shape).map(([name, field]) => {
          const { type, field: inner } = unwrap(field);
          return (
            <FieldRow
              key={name}
              name={name}
              type={type}
              inner={inner}
              value={values[name]}
              onChange={(v) => setField(name, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FieldRow({
  name,
  type,
  inner,
  value,
  onChange,
}: {
  name: string;
  type: string;
  inner: ZodTypeAny;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    // `minmax(0,1fr)` instead of `1fr` so the control column can shrink below
    // its content's intrinsic width — otherwise wide inputs (e.g. the hex
    // text field on color rows) push the popover open. `items-start` keeps
    // the label at the TOP of tall multi-row controls (like the array
    // field) so it doesn't look orphaned in the middle of the block; a
    // small top padding on the label aligns it with the first row of
    // single-line inputs.
    <div className="grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)] items-start gap-3">
      <label className="pt-1.5 text-[10px] uppercase tracking-[0.14em] text-onda-faint font-mono truncate">
        {name}
      </label>
      <div className="min-w-0">
        <FieldControl
          name={name}
          type={type}
          inner={inner}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function FieldControl({
  name,
  type,
  inner,
  value,
  onChange,
}: {
  name: string;
  type: string;
  inner: ZodTypeAny;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (type === 'ZodNumber') {
    const hint = NUMERIC_HINTS[name];
    // Optional fields with no schema default arrive as `undefined`.
    // `Number(undefined)` is NaN — passing NaN to <input value={...}>
    // triggers a React warning AND renders a broken slider. Coerce to
    // the hint's min (or 0) so the field is editable from the moment it
    // mounts.
    const fallback = hint ? hint.min : 0;
    const numeric = value === undefined || value === null ? fallback : Number(value);
    const safe = Number.isFinite(numeric) ? numeric : fallback;
    if (hint) {
      return <Slider value={safe} onChange={onChange} {...hint} />;
    }
    return <NumberInput value={safe} onChange={onChange} />;
  }

  if (type === 'ZodEnum') {
    const def = (inner as unknown as { _def: { values: string[] } })._def;
    const options = def.values;
    // Segmented is best for short, few options. For wide labels (e.g.
    // 'top-left', 'top-right') or 5+ options, fall back to a native Select
    // so the row doesn't overflow the popover column.
    const tooWide = options.some((o) => o.length > 6) || options.length > 4;
    if (tooWide) {
      const labeled = options.map((o) => ({ label: o, value: o }));
      return <SelectField value={String(value)} options={labeled} onChange={onChange} />;
    }
    return <Segmented value={String(value)} options={options} onChange={onChange} />;
  }

  if (type === 'ZodArray') {
    const def = (inner as unknown as { _def: { type: ZodTypeAny } })._def;
    const { type: itemTypeName } = unwrap(def.type);
    // Only ZodString arrays are editable today; the catalog hasn't surfaced
    // a numeric-array prop yet. Render a fallback for other element types
    // so the field at least shows up.
    if (itemTypeName === 'ZodString') {
      return (
        <ArrayField
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(v) => onChange(v)}
        />
      );
    }
    return (
      <div className="text-xs text-onda-faint italic">
        ({itemTypeName}[] — no control yet)
      </div>
    );
  }

  if (type === 'ZodString') {
    if (COLOR_PROP_NAMES.has(name)) {
      return <ColorField value={String(value)} onChange={onChange} />;
    }
    const options = STRING_OPTIONS[name];
    if (options) {
      return (
        <SelectField
          value={String(value)}
          options={options}
          onChange={onChange}
        />
      );
    }
    return <TextInput value={String(value)} onChange={onChange} />;
  }

  return (
    <div className="text-xs text-onda-faint italic">
      ({type} — no control)
    </div>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  // Local text state for the typeable input. Lets the user type intermediate
  // strings like "0." or "1." without us reformatting under their fingers.
  // Synced from `value` when the field isn't focused (so slider drags and
  // Reset propagate in cleanly).
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => formatNum(value, step));

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setText(formatNum(value, step));
  }, [value, step]);

  const commit = () => {
    const parsed = parseFloat(text);
    if (!Number.isFinite(parsed)) {
      setText(formatNum(value, step));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    setText(formatNum(clamped, step));
    if (clamped !== value) onChange(clamped);
  };

  // Percent filled (left of the thumb). Used to size the fill div and place
  // the thumb. Painted by plain <div>s — see comment above the JSX for why
  // we abandoned CSS pseudo-elements on <input type="range">.
  const fillPct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/*
        Custom slider: the visual (track, fill, thumb) is painted with plain
        <div>s we 100% control, and an invisible <input type="range"> on top
        captures clicks / drags / keyboard. WebKit's pseudo-element painting
        of the track was inconsistent on the dark popover surface (track
        either disappeared or refused to read inherited CSS variables), so
        we stopped fighting it and went pure-div. The input is a `peer` so
        the thumb can react to its :hover / :focus / :active states.
      */}
      <div className="relative flex-1 min-w-0 h-6 select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Unfilled track (full width, behind everything else). */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[5px] rounded-full bg-onda-faint" />
        {/* Filled portion (left of the thumb). */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[5px] rounded-full bg-onda-text"
          style={{ width: `${fillPct}%` }}
        />
        {/* Thumb — reacts to peer (input) hover / focus / active. */}
        <div
          className="
            pointer-events-none absolute top-1/2
            h-4 w-4 rounded-full bg-onda-text border-2 border-onda-bg
            shadow-[0_4px_10px_-2px_rgba(0,0,0,0.6)]
            transition-[transform,background-color,box-shadow] duration-150 ease-out
            peer-hover:bg-onda-accent peer-hover:scale-110 peer-hover:shadow-[0_0_0_6px_rgba(217,107,130,0.18)]
            peer-focus-visible:bg-onda-accent peer-focus-visible:scale-110 peer-focus-visible:shadow-[0_0_0_6px_rgba(217,107,130,0.18)]
            peer-active:scale-95
          "
          style={{
            left: `${fillPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      <input
        ref={inputRef}
        type="number"
        value={text}
        min={min}
        max={max}
        step={step}
        inputMode={step < 1 ? 'decimal' : 'numeric'}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
            inputRef.current?.blur();
          }
        }}
        className="onda-number-input bg-onda-bg border border-onda-border rounded-md px-1 py-1 text-xs font-mono text-onda-text tabular-nums w-11 text-right focus:outline-none focus:border-onda-text/40 shrink-0"
      />
    </div>
  );
}

// Format a number for display in the slider's input. Drops trailing zeros so
// 0.90 reads as "0.9". `step < 1` is the "decimals expected" signal.
function formatNum(value: number, step: number): string {
  if (step < 1) return String(parseFloat(value.toFixed(2)));
  return String(Math.round(value));
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // Free numeric input (no slider hint, so we don't know the range).
  // Width matches the slider-paired input for visual consistency. Values
  // longer than ~4 digits scroll horizontally inside the input.
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
      className="onda-number-input bg-onda-bg border border-onda-border rounded-md px-1 py-1 text-xs font-mono text-onda-text tabular-nums text-right focus:outline-none focus:border-onda-text/40 w-14"
    />
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-onda-bg border border-onda-border rounded-md px-2 py-1 text-sm text-onda-text focus:outline-none focus:border-onda-text/40 w-full"
    />
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  // If the current value isn't in the curated list (custom code-side value),
  // surface it with a "Custom" label so the user sees what's selected without
  // mismatching the dropdown.
  const known = options.some((o) => o.value === value);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="onda-select w-full"
    >
      {!known && <option value={value}>Custom: {value}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="onda-color-swatch shrink-0"
        aria-label="Pick color"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-onda-bg border border-onda-border rounded-md px-2 py-1 text-sm font-mono text-onda-text focus:outline-none focus:border-onda-text/40 flex-1 min-w-0"
      />
    </div>
  );
}

function ArrayField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const setItem = (i: number, next: string) => {
    const out = value.slice();
    out[i] = next;
    onChange(out);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => onChange([...value, '']);

  return (
    // Tag-input pattern: each item is a chip with an auto-sized input and an
    // X. Chips wrap to multiple rows via flex-wrap. Much more compact than
    // one-row-per-item and shows full text for typical short string arrays.
    <div className="flex flex-wrap gap-1 min-w-0 w-full">
      {value.map((item, i) => {
        // Auto-size the input to its content via the `ch` unit. Minimum
        // 3ch so a freshly-added empty chip is still visible/grabbable.
        const ch = Math.max(item.length, 3);
        return (
          <div
            key={i}
            className="inline-flex items-center gap-1 bg-onda-bg border border-onda-border rounded-md pl-2 pr-1 py-1 hover:border-onda-border-lit transition-colors"
          >
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(i, e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-onda-text font-mono p-0"
              style={{ width: `${ch}ch` }}
              aria-label={`Item ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove item ${i + 1}`}
              className="grid place-items-center w-4 h-4 rounded text-onda-faint hover:text-onda-text hover:bg-onda-surface-2 transition-colors"
            >
              <X size={10} weight="bold" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-onda-border hover:border-onda-border-lit text-[10px] uppercase tracking-[0.14em] text-onda-faint hover:text-onda-text transition-colors"
      >
        <Plus size={10} weight="bold" />
        Add
      </button>
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-onda-bg border border-onda-border rounded-md p-0.5">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              active
                ? 'bg-onda-surface-2 text-onda-text'
                : 'text-onda-faint hover:text-onda-text'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
