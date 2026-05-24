# VideoClip

A video clip with agent-friendly trim, Onda's entrance/exit fade fingerprint, and optional looping. Wraps Remotion's `<OffthreadVideo>` (preferred over `<Video>` for non-realtime renders — better seek accuracy and no audio drift). The default behavior fills the canvas (matching `ImageReveal` / `KenBurns`); pass `placement` to position the clip as a sub-canvas element.

## When to use

`VideoClip` is the **default video primitive** in the catalog — reach for it whenever you need to render a video file in an Onda composition. It carries the Onda motion identity (entrance/exit fade on `SPRING_SMOOTH`) and accepts time-string trim (`startAt: "0:04"`) so agents never compute frames.

| If you want… | Use |
| --- | --- |
| Play a trimmed video clip with Onda fade-in/out | **`VideoClip`** (this component) |
| Loop a video as a background plate | **`VideoClip`** with `loop`, `muted`, `fade={false}` |
| Crossfade between two video beats | **`VideoClip`** inside `<TransitionSeries>` with `fade={false}` on each clip (transition primitive owns the fade) |
| A bare `<video>` with no Onda motion or frame conversion | Remotion's `<OffthreadVideo>` directly |

There is no other video-consuming component in the catalog today. Don't drop down to bare `<OffthreadVideo>` for general video display — you'd lose the fingerprint and have to do frame math by hand.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | Big Buck Bunny sample URL | URL or path to the video. The default is a public sample so the playground is reproducible — supply your own `src` in real compositions. |
| `delay` | `integer ≥ 0` | `0` | Frames before the clip starts in the composition. |
| `startAt` | `string \| number` | `0` | Where to start in the **source video**. Time spec — accepts `"0:04"`, `"30s"`, `"500ms"`, `"90f"`, or a raw number of seconds. |
| `endAt` | `string \| number?` | – | Where to stop in the source video. Same time spec as `startAt`. When omitted, the clip plays to the source's end. |
| `fade` | `boolean` | `true` | Whether the clip fades in (and out, when `endAt` is set) for the Onda motion fingerprint. Set to `false` for hard cuts (typical inside a `<TransitionSeries>` where the transition primitive owns fades). |
| `fadeDuration` | `integer ≥ 0` | `DURATION.base` (18) | Frames the fade-in / fade-out takes when `fade` is true. |
| `muted` | `boolean` | `false` | Mute the audio track. |
| `volume` | `number 0..1` | `1` | Audio volume. |
| `loop` | `boolean` | `false` | Loop the trimmed clip. Requires `endAt` to be set (loop interval is `endAt - startAt`). When looping, fade-out is disabled. |
| `fit` | `'cover' \| 'contain'` | `'cover'` | How the video fits its box. |
| `placement` | `Placement?` | – | Where on the canvas the clip sits. Region or `{ x, y, anchor }` in 0..1 canvas fractions. **When omitted, the clip fills the entire canvas.** |
| `width` | `number?` | – | Explicit width in px. |
| `height` | `number?` | – | Explicit height in px. |
| `borderRadius` | `number` | `0` | Border radius in px. |

## Usage

```tsx
import { Composition } from 'remotion';
import { VideoClip, videoClipSchema } from './components/onda/video-clip/VideoClip';

export const Root: React.FC = () => (
  <Composition
    id="ProductClip"
    component={VideoClip}
    durationInFrames={180}
    fps={30}
    width={1920}
    height={1080}
    schema={videoClipSchema}
    defaultProps={{
      src: '/clip.mp4',
      delay: 0,
      startAt: '0:02',
      endAt: '0:08',
      fade: true,
      fadeDuration: 18,
      muted: false,
      volume: 1,
      loop: false,
      fit: 'cover',
      borderRadius: 0,
    }}
  />
);
```

For a looping background clip:

```tsx
<VideoClip src="/background.mp4" loop startAt={0} endAt="0:04" muted fade={false} />
```

For a placed (sub-canvas) clip:

```tsx
<VideoClip
  src="/portrait-interview.mp4"
  placement="upper-third"
  width={720}
  height={1280}
  startAt="0:00"
  endAt="0:06"
  borderRadius={12}
/>
```

## Composition notes

- **Wraps `<OffthreadVideo>`, not `<Video>`.** Per Remotion docs, `<OffthreadVideo>` is the recommended choice inside `<Player>` previews and server-side renders — better seek behavior, no audio drift. Pay no cost using it as the default.
- **Time specs via `toFrames` from `lib/timing.ts`.** `startAt` and `endAt` accept the same vocabulary used in agent-emitted timeline payloads (`"0:04"`, `"30s"`, `"500ms"`, raw seconds, or `"90f"` for explicit frames). Resolution to Remotion's frame-count props happens internally against `useVideoConfig().fps`.
- **`fade` is `true` by default.** Every other Onda component fades in on entrance — bare-cut video would feel inconsistent with the catalog. Disable explicitly inside a `<TransitionSeries>` where the transition primitive handles fades between beats.
- **Fade-out timing is derived from the trim window**, not the source video length. `endAt - startAt` (in composition frames) gives the visible clip duration; fade-out begins `fadeDuration` frames before that. Without `endAt`, the component can't know when to start fading out, so fade-out is skipped (fade-in still applies).
- **Loop disables fade-out.** A looping clip has no "end" until the parent `<Sequence>` terminates, and the component can't read the parent's duration from inside. When you need a looping background that fades out, wrap the looping `VideoClip` in a `<Sequence durationInFrames={N}>` and add a separate fade via `<TransitionSeries>` or a parent opacity envelope.
- **No motion of its own beyond the fade envelope.** The video plays at its native rate via `<OffthreadVideo>`; Onda only owns the entrance/exit opacity. For zoom / pan / Ken Burns motion over video, compose with the appropriate primitive at a future date (not in 010 scope).
