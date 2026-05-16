import { apiFetch } from "../http";

export type VaultClosetSaleWaitlistEntry = {
  id: string;
  email: string;
  userId: string | null;
  createdAt: string;
};

export type AdminVaultClosetSaleWaitlistResponse = {
  success: true;
  data: {
    total: number;
    entries: VaultClosetSaleWaitlistEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
};

export type AdminVaultClosetSaleNotifyResponse = {
  success: true;
  data: {
    totalRecipients: number;
    sent: number;
    failed: { email: string; error: string }[];
    shopUrl?: string;
    message?: string;
    devEmailBypass?: boolean;
  };
};

export const adminVaultClosetSaleWaitlistApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<AdminVaultClosetSaleWaitlistResponse>(
      `/api/admin/closets/vault-closet-sale/waitlist?page=${page}&limit=${limit}`,
    ),

  notifyAll: () =>
    apiFetch<AdminVaultClosetSaleNotifyResponse>(
      "/api/admin/closets/vault-closet-sale/notify-waitlist",
      { method: "POST" },
    ),
};
