"use client";

import { useEffect, useState } from "react";

/**
 * Increments on an interval and when the tab becomes visible again so
 * `deriveDefaultDispatchWindow` and related memos can re-run with a fresh "now".
 */
export function useDispatchScheduleClock(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const id = setInterval(bump, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return tick;
}
