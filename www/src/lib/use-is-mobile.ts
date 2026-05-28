'use client';

import { useEffect, useState } from 'react';

// Mobile breakpoint: 768px. Matches Tailwind's `md` and the catalog's
// design: phones get static thumbnails (cheap, no battery drain from a
// grid of live Players), tablets and up get the live hover-to-play
// preview. Kept as a named constant so the same value is reused across
// any callers that follow.
const MOBILE_MAX_WIDTH_PX = 767;
const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

/**
 * SSR-safe hook returning whether the viewport is below 768px CSS width.
 *
 * Defaults to `false` on first render so the server-rendered HTML
 * matches the desktop path (avoiding a hydration mismatch). On mount,
 * the real value is read from `matchMedia` and the state is updated;
 * subsequent viewport changes are tracked via a `change` listener.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
