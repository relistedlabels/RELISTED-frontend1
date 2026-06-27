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
  category?: string[];
  tags?: string;
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  condition?: "Excellent" | "Good" | "Fair";
  gender?: "Woman" | "Man" | "Unisex";
  search?: string;
  size?: string;
  color?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Filter to a single closet’s inventory (public API). Mutually exclusive with onlyWithCloset for API calls. */
  closetId?: string;
  /** When true and closetId is unset: only products with any closet (closet drops). Ignored if closetId is set. */
  onlyWithCloset?: boolean;
  /** Filter to a shop sale campaign (slug). */
  sale?: string;
};

export const useProducts = (
  filters?: ProductFilters,
  options?: { enabled?: boolean },
) =>
  useQuery<UserProduct[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await productApi.getAll(filters);
      return response.data.products;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
