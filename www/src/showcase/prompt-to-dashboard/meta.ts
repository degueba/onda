export const promptToDashboardMeta = {
  slug: 'prompt-to-dashboard',
  title: 'Prompt to dashboard · 8s',
  description:
    "Landscape (1280×720) AI-generation beat. An InputField types out the prompt 'Build me a sales dashboard', a 3D flip drops into a 'generating' state where SkeletonCard placeholders shimmer, then a second flip reveals the finished result — a BentoGrid of KPIs plus a CountUp revenue figure and a quarterly BarChart. The two flip transitions sell the prompt → generate → reveal arc.",
  duration: 8,
  fps: 30,
  width: 1280,
  height: 720,
  categoriesUsed: ['interface', 'data', 'transitions', 'scenes'],
  category: 'developer' as const,
} as const;
