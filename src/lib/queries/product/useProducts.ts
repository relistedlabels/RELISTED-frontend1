import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import type { UserProduct } from "@/lib/api/product";

type ProductFilters = {
  page?: number;
  limit?: number;
  sort?:
    | "newest"
    | "oldest"
    | "price_low"
    | "price_high"
    | "popular"
    | "rating";
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: "Excellent" | "Good" | "Fair";
  gender?: "Woman" | "Man" | "Unisex";
  search?: string;
  sizes?: string;
  categories?: string[];
  brands?: string[];
};

export const useProducts = (filters?: ProductFilters) =>
  useQuery<UserProduct[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await productApi.getAll(filters);
      return response.data.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
