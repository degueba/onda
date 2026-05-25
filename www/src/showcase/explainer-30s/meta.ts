// Metadata for the Explainer 30s showcase. Kept in its own file so the
// gallery index can collect lightweight metas without pulling in every
// composition's full module (and its component imports).
export const explainer30sMeta = {
  slug: 'explainer-30s',
  title: 'Explainer · 30s',
  description:
    "Classic 30-second product explainer — title beat, three feature beats with synchronized text + data, a stat punctuation, and a CTA close. Demonstrates how scene blocks, typography primitives, and the new transitions catalog compose into a complete short.",
  duration: 30,
  fps: 30,
  width: 1920,
  height: 1080,
  categoriesUsed: ['scene blocks', 'typography', 'data', 'transitions'],
  category: 'marketing' as const,
} as const;
