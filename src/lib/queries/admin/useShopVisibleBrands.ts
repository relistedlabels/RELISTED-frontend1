import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminShopSettingsApi } from "@/lib/api/admin/shopSettings";

export const useVisibleShopBrands = () =>
  useQuery({
    queryKey: ["admin", "shop-settings", "visible-brands"],
    queryFn: () => adminShopSettingsApi.getVisibleBrands(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useSetVisibleShopBrands = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandIds: string[]) =>
      adminShopSettingsApi.setVisibleBrands(brandIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-settings", "visible-brands"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-settings", "prioritized-brands"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
  });
};
