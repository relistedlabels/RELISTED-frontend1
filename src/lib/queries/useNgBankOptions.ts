"use client";

import { useMemo } from "react";
import {
  FALLBACK_NG_BANK_OPTIONS,
  type RenterBankOption,
} from "@/lib/renters/renterBankOptions";

/**
 * Nigeria bank name + code options for payout forms.
 * Uses the static list in `renterBankOptions` only (does not call `getBanks` / `useBanks`).
 */
export function useNgBankOptions(country: string = "NG") {
  const bankOptions: RenterBankOption[] = useMemo(() => {
    if (country !== "NG") return [];
    return [...FALLBACK_NG_BANK_OPTIONS];
  }, [country]);

  return {
    bankOptions,
    isLoading: false,
    isError: false,
  };
}
