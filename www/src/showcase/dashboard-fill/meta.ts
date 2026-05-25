export const dashboardFillMeta = {
  slug: 'dashboard-fill',
  title: 'Dashboard fill · 8s',
  description:
    "Landscape (1280×720) two-act report. Act 1 lays out an empty scaffold — four shimmering SkeletonCard placeholders on a ruled DynamicGrid. A cross-fade then populates the exact same four slots with real data: CountUp KPIs, a BarChart of quarterly revenue, a LineChart trend, and a central PieReveal for goal completion. The populate staggers slot by slot so the 'structure first, then fill' story reads cleanly.",
  duration: 8,
  fps: 30,
  width: 1280,
  height: 720,
  categoriesUsed: ['data', 'interface', 'transitions', 'scenes'],
  category: 'reports' as const,
} as const;
