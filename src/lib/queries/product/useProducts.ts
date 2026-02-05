import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await productApi.getAll();
      return response.data.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
