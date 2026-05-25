export const boardFlowMeta = {
  slug: 'board-flow',
  title: 'Board flow · 8s',
  description:
    "Landscape (1280×720) workflow story. A three-column kanban-board (Todo / In Progress / Done) assembles, then a single glass ticket card glides Todo → In Progress → Done on a deterministic, eased arc — keyed off the frame, with a slight lift and rotate on each hand-off — while a count-up plays an in-progress timer. The moment it lands in Done, a confetti burst fires over the column. The interface category as the lead.",
  duration: 8,
  fps: 30,
  width: 1280,
  height: 720,
  categoriesUsed: ['interface', 'data', 'celebration'],
  category: 'developer' as const,
} as const;
