import { useQuery } from "@tanstack/react-query";
import { getWithdrawalStatus } from "@/lib/api/listers";

export function useWithdrawalStatus(withdrawalId: string) {
  return useQuery({
    queryKey: ["listers", "wallet", "withdraw", withdrawalId],
    queryFn: () => getWithdrawalStatus(withdrawalId),
    enabled: !!withdrawalId,
    staleTime: 2 * 60 * 1000, // 2 minutes for frequent updates
  });
}
