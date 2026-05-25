export const kpiSnapshotMeta = {
  slug: 'kpi-snapshot',
  title: 'KPI snapshot · 8s',
  description:
    "Landscape (1920×1080) metrics tile board. Four StatCards in a 2×2 grid — MRR, growth, users, retention — all stagger in together for the dashboard-screenshot share. All-at-once layout, no beats, no transitions — distinct from `data-dashboard`'s beat-driven story.",
  duration: 8,
  fps: 30,
  width: 1920,
  height: 1080,
  categoriesUsed: ['data', 'typography', 'scene blocks'],
  category: 'reports' as const,
} as const;
