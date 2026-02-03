import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export const useUserProducts = () =>
  useQuery({
    queryKey: ["user-products"],
    queryFn: async () => {
      const response = await productApi.getUserProducts();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
