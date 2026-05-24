// Time-string parsing for agent-friendly composition payloads.
//
// Remotion's `<Sequence>` and `<Series.Sequence>` take `durationInFrames`
// (and `from` as frame counts). LLM-generated payloads naturally express
// time as `"0:04"` or `"30s"`, not `120` or `90`. This module is the one
// translation layer Remotion doesn't ship — keep it small.
//
// See `lib/canvas.tsx` for the placement / size vocabulary that also
// supports the agent-facing composing-with-onda doc.

/** Matches `"M:SS"` or `"M:SS.ms"` — e.g. `"1:30"`, `"0:04"`, `"2:15.500"`. */
const COLON_PATTERN = /^(\d+):([0-5]\d)(?:\.(\d{1,3}))?$/;

/** Matches `"Ns"` — seconds with explicit suffix, e.g. `"30s"`, `"4.5s"`. */
const SECONDS_PATTERN = /^(\d+(?:\.\d+)?)s$/;

/** Matches `"Nms"` — milliseconds, e.g. `"500ms"`. */
const MS_PATTERN = /^(\d+(?:\.\d+)?)ms$/;

/** Matches `"Nf"` — explicit frame counts (bypass time parsing). */
const FRAMES_PATTERN = /^(\d+)f$/;

/**
 * Parse a time spec to seconds.
 *
 * Accepted forms:
 * - `number` — passed through as seconds.
 * - `"M:SS"` / `"M:SS.ms"` — colon-separated minutes and seconds (`"0:04"`, `"1:30.500"`).
 * - `"Ns"` — seconds with suffix (`"30s"`, `"4.5s"`).
 * - `"Nms"` — milliseconds (`"500ms"`).
 *
 * Throws on invalid input — silent NaN would let bad payloads render at
 * frame 0 indefinitely, which is harder to debug.
 *
 * @example
 * parseTime("0:04")      // 4
 * parseTime("1:30")      // 90
 * parseTime("2:15.500")  // 135.5
 * parseTime("30s")       // 30
 * parseTime("500ms")     // 0.5
 * parseTime(4)           // 4
 */
export function parseTime(input: string | number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) {
      throw new Error(`parseTime: numeric input must be a non-negative finite number, got ${input}`);
    }
    return input;
  }

  const s = input.trim();

  const colon = s.match(COLON_PATTERN);
  if (colon) {
    const [, minutes, seconds, ms] = colon;
    return Number(minutes) * 60 + Number(seconds) + (ms ? Number(`0.${ms}`) : 0);
  }

  const seconds = s.match(SECONDS_PATTERN);
  if (seconds) return Number(seconds[1]);

  const ms = s.match(MS_PATTERN);
  if (ms) return Number(ms[1]) / 1000;

  throw new Error(
    `parseTime: invalid time spec ${JSON.stringify(input)}. ` +
      `Use "M:SS" (e.g. "0:04"), "Ns" (e.g. "30s"), "Nms" (e.g. "500ms"), or a number of seconds.`,
  );
}

/**
 * Convert a time spec to frames at the given fps.
 *
 * Accepts everything {@link parseTime} accepts, plus:
 * - `"Nf"` — explicit frame counts (`"90f"` returns `90` regardless of fps).
 *
 * Result is rounded to the nearest integer frame.
 *
 * @example
 * toFrames("0:04", 30)   // 120
 * toFrames("1:30", 60)   // 5400
 * toFrames("500ms", 30)  // 15
 * toFrames("90f", 30)    // 90  (explicit frame count, fps ignored)
 * toFrames(2, 30)        // 60  (raw seconds)
 *
 * @example Studio's timeline → Remotion JSX
 * const { fps } = useVideoConfig();
 * <Sequence from={toFrames(entry.at, fps)} durationInFrames={toFrames(entry.for, fps)}>
 *   {renderComponent(entry.component, entry.props)}
 * </Sequence>
 */
export function toFrames(input: string | number, fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`toFrames: fps must be a positive finite number, got ${fps}`);
  }

  if (typeof input === 'string') {
    const frames = input.trim().match(FRAMES_PATTERN);
    if (frames) return Number(frames[1]);
  }

  return Math.round(parseTime(input) * fps);
}
