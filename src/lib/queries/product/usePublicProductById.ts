import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export const usePublicProductById = (productId: string) =>
  useQuery({
    queryKey: ["public-product", productId],
    queryFn: async () => {
      console.log("🔄 usePublicProductById: Fetching product ID:", productId);
      try {
        // Use the public product endpoint which returns wrapped response
        const response = await productApi.getPublicById(productId);
        console.log("✅ usePublicProductById: Response received:", response);
        console.log("📦 usePublicProductById: Product data:", response.data);
        // Extract the product from the response data
        return response.data;
      } catch (error) {
        console.error(
          "❌ usePublicProductById: Error fetching product:",
          error,
        );
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!productId,
  });
