import { apiFetch } from "./http";

export type VaultClosetSaleInterestResponse = {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
};

export function registerVaultClosetSaleInterest(email: string) {
  return apiFetch<VaultClosetSaleInterestResponse>(
    "/api/public/vault-closet-sale/interest",
    { method: "POST", body: JSON.stringify({ email }) },
  );
}
