export const liveMetricsMeta = {
  slug: 'live-metrics',
  title: 'Live metrics · 11s',
  description:
    "Landscape (1920×1080) live dashboard. A PulsingIndicator marks the feed live, a StatCard headlines the hero number, a LineChart draws the trend on a drifting DynamicGrid, and a BarChart breaks it down. The new data + atmosphere primitives as a real-time report — numbers that feel alive, not static.",
  duration: 11,
  fps: 30,
  width: 1920,
  height: 1080,
  categoriesUsed: ['data', 'interface', 'atmosphere', 'scenes'],
  category: 'reports' as const,
} as const;
