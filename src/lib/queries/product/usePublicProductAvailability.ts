import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicProductAvailability = (
  productId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  },
) =>
  useQuery({
    queryKey: ["product-availability", productId, params],
    queryFn: async () => {
      const response = await publicApi.getProductAvailability(
        productId,
        params,
      );
      return response.data.availability;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!productId,
  });
