import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Converts vertical wheel movement into horizontal scroll on `ref`.
 * Uses `{ passive: false }` so `preventDefault` works. React's `onWheel` is
 * often passive, which causes "Unable to preventDefault inside passive event listener".
 */
export function useHorizontalWheelScroll(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 0) return;

      const before = el.scrollLeft;
      el.scrollLeft += e.deltaY;
      const after = el.scrollLeft;

      // Only block vertical page scroll if this strip actually scrolled.
      // Otherwise the wheel should propagate so the page keeps moving (fixes
      // "stuck" scrolling when the cursor is over Closet Drops / carousels).
      if (Math.abs(after - before) > 0.5) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [enabled, ref]);
}
