import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export function usePublicSiteFeatures() {
  return useQuery({
    queryKey: ["public", "site-features"],
    queryFn: () => publicApi.getSiteFeatures(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
