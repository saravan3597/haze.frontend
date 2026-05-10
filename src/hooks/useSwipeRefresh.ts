import { useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Options {
  onRefresh: () => void;
  /** Minimum downward distance in px to trigger. Default: 70 */
  distanceThreshold?: number;
  /** Minimum velocity in px/ms to trigger (hard swipe). Default: 0.4 */
  velocityThreshold?: number;
}

export function useSwipeRefresh(
  elementRef: React.RefObject<HTMLElement>,
  { onRefresh, distanceThreshold = 70, velocityThreshold = 0.4 }: Options,
) {
  const touchStart = useRef<{ y: number; t: number } | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      touchStart.current = { y: e.touches[0].clientY, t: Date.now() };
    }

    async function onTouchEnd(e: TouchEvent) {
      if (!touchStart.current) return;
      const endY = e.changedTouches[0].clientY;
      const endT = Date.now();
      const deltaY = endY - touchStart.current.y;
      const elapsed = endT - touchStart.current.t;
      const velocity = deltaY / Math.max(elapsed, 1);
      touchStart.current = null;

      if (deltaY >= distanceThreshold && velocity >= velocityThreshold) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // silently skip on web — haptics not available
        }
        onRefresh();
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [elementRef, onRefresh, distanceThreshold, velocityThreshold]);
}
