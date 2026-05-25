// Walk a ComponentRegistry and produce structured / markdown summaries
// agents can feed into a system prompt. Uses JSON Schema (via
// zod-to-json-schema) as the introspection format — stable and well-known.

import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';
import type { ComponentRegistry } from './composition-renderer';

export type RegistryPropSummary = {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
};

export type RegistryComponentSummary = {
  name: string;
  description?: string;
  supportsPlacement: boolean;
  supportsSize: boolean;
  keyProps: RegistryPropSummary[];
};

export type RegistrySummary = {
  components: RegistryComponentSummary[];
};

/**
 * Catalog entry for a transition. Mirrors {@link RegistryComponentSummary}
 * shape minus the component-specific capability flags (transitions don't
 * support `placement` / `size` — those concepts apply to scene rendering,
 * not to the cut between scenes).
 */
export type RegistryTransitionSummary = {
  name: string;
  description?: string;
  options: RegistryPropSummary[];
};

export type TransitionRegistrySummary = {
  transitions: RegistryTransitionSummary[];
};

/**
 * Minimal shape for the transitions registry consumed by
 * {@link summarizeTransitionRegistry}. Each entry is a factory + the Zod
 * schema that validates the factory's options.
 *
 * Kept separate from `ComponentRegistry` because transitions are
 * factories (not React components) and the entry shape genuinely
 * differs. Agents need to see them as a distinct category — Studio's
 * dispatch table maps `kind: 'cross-fade'` to a transition factory,
 * not a scene component.
 */
export type TransitionRegistry = Record<
  string,
  { schema: ZodTypeAny }
>;

// Render a JSON Schema fragment as a compact TS-flavored type string.
// Covers the shapes that show up in Onda schemas (enums, unions, primitives,
// arrays, literal objects); falls back to 'unknown' for anything exotic.
function jsonSchemaToTypeString(schema: unknown): string {
  if (!schema || typeof schema !== 'object') return 'unknown';
  const s = schema as Record<string, unknown>;
  if (Array.isArray(s.enum)) return s.enum.map((v) => JSON.stringify(v)).join(' | ');
  if (s.const !== undefined) return JSON.stringify(s.const);
  if (Array.isArray(s.anyOf)) return s.anyOf.map(jsonSchemaToTypeString).join(' | ');
  if (Array.isArray(s.oneOf)) return s.oneOf.map(jsonSchemaToTypeString).join(' | ');
  if (s.type === 'array') return `${jsonSchemaToTypeString(s.items)}[]`;
  if (s.type === 'object') return 'object';
  if (Array.isArray(s.type)) return (s.type as string[]).join(' | ');
  return (s.type as string) ?? 'unknown';
}

export function summarizeRegistry(registry: ComponentRegistry): RegistrySummary {
  const components: RegistryComponentSummary[] = Object.entries(registry).map(
    ([name, { schema }]) => {
      const raw = zodToJsonSchema(schema, name) as Record<string, unknown>;
      // zodToJsonSchema with a name wraps in { $ref, definitions: { [name]: ... } }
      const def = (raw.definitions as Record<string, Record<string, unknown>> | undefined)?.[name]
        ?? raw;
      const properties = (def.properties as Record<string, Record<string, unknown>>) ?? {};
      const required = new Set((def.required as string[]) ?? []);

      const keyProps: RegistryPropSummary[] = Object.entries(properties).map(
        ([propName, propSchema]) => ({
          name: propName,
          type: jsonSchemaToTypeString(propSchema),
          required: required.has(propName),
          default: propSchema.default,
          description: propSchema.description as string | undefined,
        }),
      );

      return {
        name,
        description: def.description as string | undefined,
        supportsPlacement: 'placement' in properties,
        supportsSize: 'size' in properties,
        keyProps,
      };
    },
  );

  return { components };
}

/**
 * Walk a transition registry and produce the same kind of structured
 * summary {@link summarizeRegistry} produces for components — names,
 * descriptions, option props. Lives as a separate function (not a
 * field on `RegistrySummary`) so consumers can opt in without paying
 * the bundle cost for a category they don't use.
 *
 * Pair with {@link summarizeRegistry} when building an agent system
 * prompt that needs both — typically:
 *   `{ ...summarizeRegistry(componentRegistry), ...summarizeTransitionRegistry(transitionRegistry) }`
 */
export function summarizeTransitionRegistry(
  registry: TransitionRegistry,
): TransitionRegistrySummary {
  const transitions: RegistryTransitionSummary[] = Object.entries(registry).map(
    ([name, { schema }]) => {
      const raw = zodToJsonSchema(schema, name) as Record<string, unknown>;
      const def =
        (raw.definitions as Record<string, Record<string, unknown>> | undefined)?.[name] ?? raw;
      const properties =
        (def.properties as Record<string, Record<string, unknown>>) ?? {};
      const required = new Set((def.required as string[]) ?? []);

      const options: RegistryPropSummary[] = Object.entries(properties).map(
        ([propName, propSchema]) => ({
          name: propName,
          type: jsonSchemaToTypeString(propSchema),
          required: required.has(propName),
          default: propSchema.default,
          description: propSchema.description as string | undefined,
        }),
      );

      return {
        name,
        description: def.description as string | undefined,
        options,
      };
    },
  );

  return { transitions };
}

/**
 * Markdown form, ready to paste into an LLM system prompt. One section
 * per component with a prop table. Use this if you don't need a custom
 * format; otherwise call {@link summarizeRegistry} and render your own.
 */
export function summarizeRegistryAsMarkdown(registry: ComponentRegistry): string {
  const summary = summarizeRegistry(registry);
  const lines: string[] = [];

  for (const c of summary.components) {
    lines.push(`### ${c.name}`);
    if (c.description) lines.push('', c.description);

    const caps: string[] = [];
    if (c.supportsPlacement) caps.push('`placement`');
    if (c.supportsSize) caps.push('`size`');
    if (caps.length) lines.push('', `*supports:* ${caps.join(', ')}`);

    lines.push('', '| prop | type | required | default | notes |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const p of c.keyProps) {
      const def = p.default !== undefined ? `\`${JSON.stringify(p.default)}\`` : '—';
      const req = p.required ? '✓' : '';
      const note = p.description ?? '';
      lines.push(`| \`${p.name}\` | \`${p.type}\` | ${req} | ${def} | ${note} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
