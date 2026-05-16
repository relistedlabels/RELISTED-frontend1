import { useQuery } from "@tanstack/react-query";
import { adminVaultClosetSaleWaitlistApi } from "@/lib/api/admin/vaultClosetSaleWaitlist";

export function useAdminVaultClosetSaleWaitlist(
  page = 1,
  limit = 20,
  enabled = true,
) {
  return useQuery({
    queryKey: ["admin", "vault-closet-sale-waitlist", page, limit],
    queryFn: () => adminVaultClosetSaleWaitlistApi.list(page, limit),
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
