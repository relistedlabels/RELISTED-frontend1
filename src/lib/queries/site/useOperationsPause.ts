"use client";

import { useMemo } from "react";
import {
  normalizeOperationsPause,
  notifyOperationsPauseBlocked,
  operationsPauseFromEnv,
  type OperationsPauseState,
} from "@/lib/operations/operationsPause";
import { usePublicSiteFeatures } from "./useSiteFeatures";

export function useOperationsPause(): OperationsPauseState & {
  /** @deprecated use pauseReady */
  isLoading: boolean;
  /** Pause flag is safe to use (env or API settled). */
  pauseReady: boolean;
  transactionsBlocked: boolean;
  blockTransaction: () => boolean;
} {
  const { data, isPending } = usePublicSiteFeatures();
  const envPause = useMemo(() => operationsPauseFromEnv(), []);

  const pause = useMemo(() => {
    const fromApi = normalizeOperationsPause(data?.data?.operationsPause);
    if (fromApi.active) return fromApi;
    if (envPause) return envPause;
    return fromApi;
  }, [data?.data?.operationsPause, envPause]);

  const pauseReady =
    Boolean(envPause?.active) ||
    Boolean(data?.data?.operationsPause) ||
    !isPending;

  const blockTransaction = () => {
    if (!pause.active) return false;
    notifyOperationsPauseBlocked(pause);
    return true;
  };

  return {
    ...pause,
    isLoading: !pauseReady,
    pauseReady,
    transactionsBlocked: pause.active,
    blockTransaction,
  };
}
