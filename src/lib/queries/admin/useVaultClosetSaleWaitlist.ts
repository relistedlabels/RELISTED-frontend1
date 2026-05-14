import { useQuery } from "@tanstack/react-query";
import { adminVaultClosetSaleWaitlistApi } from "@/lib/api/admin/vaultClosetSaleWaitlist";

export function useAdminVaultClosetSaleWaitlist(enabled = true) {
  return useQuery({
    queryKey: ["admin", "vault-closet-sale-waitlist"],
    queryFn: () => adminVaultClosetSaleWaitlistApi.list(),
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
