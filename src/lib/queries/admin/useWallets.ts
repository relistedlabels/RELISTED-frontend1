import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletsApi } from "@/lib/api/admin/";

interface WalletListParams {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface EscrowListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface TransactionListParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface WithdrawalListParams {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface PayoutListParams {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useWalletStats = () =>
  useQuery({
    queryKey: ["admin", "wallets", "stats"],
    queryFn: () => walletsApi.getStats(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useWallets = (params: WalletListParams = {}) =>
  useQuery({
    queryKey: ["admin", "wallets", params.search, params.page, params.limit],
    queryFn: () => walletsApi.getWallets(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });

export const useWalletById = (walletId: string) =>
  useQuery({
    queryKey: ["admin", "wallets", walletId],
    queryFn: () => walletsApi.getWalletById(walletId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!walletId,
  });

export const useEscrows = (params: EscrowListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "wallets",
      "escrows",
      params.search,
      params.status,
      params.page,
      params.limit,
    ],
    queryFn: () => walletsApi.getEscrows(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });

export const useWalletTransactions = (params: TransactionListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "wallets",
      "transactions",
      params.search,
      params.type,
      params.status,
      params.page,
      params.limit,
    ],
    queryFn: () => walletsApi.getTransactions(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });

export const useWithdrawalRequests = (params: WithdrawalListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "wallets",
      "withdrawal-requests",
      params.search,
      params.page,
      params.limit,
    ],
    queryFn: () => walletsApi.getWithdrawalRequests(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });

export const useUpdateAdminWithdrawalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      withdrawalId,
      status,
      note,
    }: {
      withdrawalId: string;
      status: "APPROVED" | "REJECTED";
      note?: string;
    }) => walletsApi.updateWithdrawalStatus(withdrawalId, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", "withdrawal-requests"],
      });
    },
  });
};

export const useMarkWithdrawalAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      withdrawalId,
      trackingId,
    }: {
      withdrawalId: string;
      trackingId: string;
    }) => walletsApi.markWithdrawalAsPaid(withdrawalId, trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", "withdrawal-requests"],
      });
    },
  });
};

export const usePayouts = (params: PayoutListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "wallets",
      "payouts",
      params.search,
      params.page,
      params.limit,
    ],
    queryFn: () => walletsApi.getPayouts(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });
