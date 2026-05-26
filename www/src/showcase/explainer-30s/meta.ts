// Metadata for the Explainer 30s showcase. Kept in its own file so the
// gallery index can collect lightweight metas without pulling in every
// composition's full module (and its component imports).
export const explainer30sMeta = {
  slug: 'explainer-30s',
  title: 'Explainer · 30s',
  description:
    "The 'why Onda matters' trailer — five acts in 30 seconds. A premise (\"video, in code\") asks the question, a brand reveal answers it, two proof beats show the signature (calm by default, bold when it earns it), a terminal demos the install, and an end-card closes. Eight component types stitched with seven transition flavors — glass-wipe, depth-push, morph, zoom, dip-to-color through the accent rose, blur, cross-fade — over one continuous atmosphere of gradient drift, dot grid, grain, and vignette.",
  duration: 30,
  fps: 30,
  width: 1920,
  height: 1080,
  categoriesUsed: ['typography', 'scene blocks', 'data', 'interface', 'graphics', 'atmosphere', 'transitions'],
  category: 'marketing' as const,
} as const;
