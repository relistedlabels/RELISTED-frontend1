import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export const useProductStatistics = () =>
  useQuery({
    queryKey: ["product", "statistics"],
    queryFn: async () => {
      const response = await productApi.getStatistics();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
