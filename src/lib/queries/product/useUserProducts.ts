// lib/queries/product/useUserProducts.ts
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export const useUserProducts = () =>
  useQuery({
    queryKey: ["user-products"],
    queryFn: async () => {
      const response = await productApi.getUserProducts();
      console.log("API Response:", response);
      console.log("Response Data:", response.data);
      // ✅ Extract data array from response wrapper
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
