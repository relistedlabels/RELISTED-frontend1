import { useQuery } from "@tanstack/react-query";
import { type AdminSearchResult, adminSearchApi } from "@/lib/api/admin/search";

export const useAdminSearch = (query: string, params?: { limit?: number }) => {
  return useQuery({
    queryKey: ["admin-search", query, params],
    queryFn: async () => {
      if (!query.trim()) {
        return { results: [] };
      }
      const response = await adminSearchApi.search(query, params);
      return response.data;
    },
    enabled: !!query.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export type { AdminSearchResult };
