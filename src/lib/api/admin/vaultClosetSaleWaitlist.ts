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
  list: () =>
    apiFetch<AdminVaultClosetSaleWaitlistResponse>(
      "/api/admin/closets/vault-closet-sale/waitlist",
    ),

  notifyAll: () =>
    apiFetch<AdminVaultClosetSaleNotifyResponse>(
      "/api/admin/closets/vault-closet-sale/notify-waitlist",
      { method: "POST" },
    ),
};
