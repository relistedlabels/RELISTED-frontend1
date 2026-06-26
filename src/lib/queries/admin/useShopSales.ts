import { useQuery } from "@tanstack/react-query";
import { adminShopSalesApi } from "@/lib/api/admin/shopSales";

export function useAdminShopSales(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "shop-sales", page, limit],
    queryFn: () => adminShopSalesApi.list(page, limit),
  });
}

export function useAdminShopSaleDetail(saleId: string | null) {
  return useQuery({
    queryKey: ["admin", "shop-sales", saleId],
    queryFn: () => adminShopSalesApi.get(saleId!),
    enabled: Boolean(saleId),
  });
}

export function useAdminShopSalePicker(
  params: {
    search?: string;
    page?: number;
    limit?: number;
    saleId?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ["admin", "shop-sales", "picker", params],
    queryFn: () => adminShopSalesApi.searchProducts(params),
    enabled,
  });
}

export function useAdminShopSaleWaitlist(
  saleId: string | null,
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ["admin", "shop-sales", saleId, "waitlist", page, limit],
    queryFn: () => adminShopSalesApi.waitlist(saleId!, page, limit),
    enabled: Boolean(saleId),
  });
}
