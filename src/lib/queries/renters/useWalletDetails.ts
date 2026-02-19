import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useLockedBalances = () =>
  useQuery({
    queryKey: ["renters", "wallet", "locked-balances"],
    queryFn: async () => {
      const response = await rentersApi.getLockedBalances();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useWithdrawalStatus = (withdrawalId: string) =>
  useQuery({
    queryKey: ["renters", "wallet", "withdrawals", withdrawalId],
    queryFn: async () => {
      const response = await rentersApi.getWithdrawalStatus(withdrawalId);
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    retry: 1,
    enabled: !!withdrawalId,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
