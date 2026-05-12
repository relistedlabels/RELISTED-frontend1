import { useQuery } from "@tanstack/react-query";
import { adminSiteFeaturesApi } from "@/lib/api/admin/siteFeatures";

export function useAdminSiteFeatures(enabled = true) {
  return useQuery({
    queryKey: ["admin", "site-features"],
    queryFn: () => adminSiteFeaturesApi.get(),
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
