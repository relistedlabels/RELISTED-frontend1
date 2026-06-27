import { useQuery } from "@tanstack/react-query";
import { shopSaleApi } from "@/lib/api/shopSale";

export function useActiveShopSales() {
  return useQuery({
    queryKey: ["shop-sales", "active"],
    queryFn: () => shopSaleApi.listActive(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useFeaturedShopSale() {
  return useQuery({
    queryKey: ["shop-sales", "featured"],
    queryFn: () => shopSaleApi.getFeatured(),
    staleTime: 60_000,
  });
}

export function usePublicShopSale(slug: string | null) {
  return useQuery({
    queryKey: ["shop-sales", slug],
    queryFn: () => shopSaleApi.getBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
