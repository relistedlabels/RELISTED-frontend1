import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminShopSettingsApi } from "@/lib/api/admin/shopSettings";

export const usePrioritizedShopBrands = () =>
  useQuery({
    queryKey: ["admin", "shop-settings", "prioritized-brands"],
    queryFn: () => adminShopSettingsApi.getPrioritizedBrands(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useSetPrioritizedShopBrands = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandIds: string[]) =>
      adminShopSettingsApi.setPrioritizedBrands(brandIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-settings", "prioritized-brands"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
