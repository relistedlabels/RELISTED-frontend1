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
  /** When true and no closetId, only products assigned to a closet (public shop parity). */
  onlyWithCloset?: boolean;
};

export const useProducts = (filters?: ProductFilters) =>
  useQuery<UserProduct[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await productApi.getAll(filters);
      const closetScope = Boolean(
        filters?.closetId || filters?.onlyWithCloset,
      );
      const filteredProducts = response.data.products.filter((product) => {
        if (closetScope) {
          return (
            product.status === "APPROVED" ||
            product.status === "AVAILABLE" ||
            product.status === "RENTED" ||
            product.status === "SOLD"
          );
        }
        return (
          product.status === "APPROVED" || product.status === "AVAILABLE"
        );
      });
      return filteredProducts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
