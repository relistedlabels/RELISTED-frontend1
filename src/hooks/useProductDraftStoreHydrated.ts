import { useEffect, useState } from "react";
import { useProductDraftStore } from "@/store/useProductDraftStore";

/** True once the product draft store has rehydrated from localStorage. */
export function useProductDraftStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useProductDraftStore.persist;
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
