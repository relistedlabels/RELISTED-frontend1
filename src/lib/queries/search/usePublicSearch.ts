import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicSearch = (
  query: string,
  params?: {
    type?: "product" | "brand" | "lister" | "all";
    limit?: number;
  },
) =>
  useQuery({
    queryKey: ["public-search", query, params],
    queryFn: async () => {
      const response = await publicApi.search(query, params);
      return response.data.results;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!query, // Only run query if query string is provided
  });
