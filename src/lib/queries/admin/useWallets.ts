import { useQuery } from "@tanstack/react-query";
import { walletsApi } from "@/lib/api/admin/";

interface WalletListParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface EscrowListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface TransactionListParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
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
  });
