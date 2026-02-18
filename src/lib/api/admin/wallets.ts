import { apiFetch } from "../http";

export interface WalletStats {
  totalWalletBalance: {
    amount: number;
    currency: string;
    percentage: number;
  };
  totalEscrowLocked: {
    amount: number;
    currency: string;
    percentage: number;
  };
  releasedToCurators: {
    amount: number;
    currency: string;
    percentage: number;
  };
  platformEarnings: {
    amount: number;
    currency: string;
    percentage: number;
  };
}

export interface Wallet {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  totalBalance: number;
  availableBalance: number;
  lockedAmount: number;
  lastUpdated: string;
  status: "active" | "inactive";
}

export interface WalletDetail extends Wallet {
  userEmail: string;
  userRole: string;
  joinDate: string;
  accountHistory: Array<{
    event: string;
    date: string;
  }>;
}

export interface Escrow {
  id: string;
  orderId: string;
  dresser: {
    id: string;
    name: string;
    avatar: string;
  };
  curator: {
    id: string;
    name: string;
    avatar: string;
  };
  lockedAmount: number;
  reason: string;
  lockedDate: string;
  releaseDate: string;
  status: "locked" | "pending" | "released";
}

export interface WalletTransaction {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  date: string;
  time: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

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

function buildWalletParams(params: WalletListParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

function buildEscrowParams(params: EscrowListParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append("search", params.search);
  if (params.status) searchParams.append("status", params.status);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

function buildTransactionParams(params: TransactionListParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append("search", params.search);
  if (params.type) searchParams.append("type", params.type);
  if (params.status) searchParams.append("status", params.status);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

export const walletsApi = {
  getStats: () =>
    apiFetch<{ success: true; data: WalletStats }>(`/api/admin/wallets/stats`),

  getWallets: (params: WalletListParams) =>
    apiFetch<{
      success: true;
      data: {
        wallets: Wallet[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/wallets?${buildWalletParams(params)}`),

  getWalletById: (walletId: string) =>
    apiFetch<{ success: true; data: WalletDetail }>(
      `/api/admin/wallets/${walletId}`,
    ),

  getEscrows: (params: EscrowListParams) =>
    apiFetch<{
      success: true;
      data: {
        escrows: Escrow[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/wallets/escrow?${buildEscrowParams(params)}`),

  releaseEscrow: (escrowId: string, reason: string) =>
    apiFetch(`/api/admin/wallets/escrow/${escrowId}/release`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }),

  getTransactions: (params: TransactionListParams) =>
    apiFetch<{
      success: true;
      data: {
        transactions: WalletTransaction[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/wallets/transactions?${buildTransactionParams(params)}`),

  exportWallets: (format: "csv" | "pdf", dataType: string, filters?: any) =>
    apiFetch(`/api/admin/wallets/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, dataType, filters }),
    }),
};
