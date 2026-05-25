export const liveStreamOverlayMeta = {
  slug: 'live-stream-overlay',
  title: 'Live-stream overlay · loop',
  description:
    "Landscape (1920×1080) Twitch / OBS overlay loop. Bottom-anchored `equalizer` bars (two-tone rose) under a now-playing strip, with a LIVE pill upper-left and a watcher count upper-right. Designed to be mounted once and run forever — entrances are short, the equalizer carries the eye, the rest is static UI.",
  duration: 10,
  fps: 30,
  width: 1920,
  height: 1080,
  categoriesUsed: ['audio', 'typography', 'scene blocks'],
  hasAudio: true,
  category: 'media' as const,
} as const;
