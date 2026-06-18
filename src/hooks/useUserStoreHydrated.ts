import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

/** True once Zustand has rehydrated auth state from localStorage (client only). */
export function useUserStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useUserStore.persist;
    if (!persist?.hasHydrated || !persist.onFinishHydration) {
      setHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
