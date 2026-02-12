import { useQuery } from "@tanstack/react-query";
import { getLockedBalances } from "@/lib/api/listers";

export function useLockedBalances() {
  return useQuery({
    queryKey: ["listers", "wallet", "locked-balances"],
    queryFn: getLockedBalances,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
