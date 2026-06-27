import { apiFetch } from "../http";

export type PrioritizedBrand = {
  id: string;
  name: string;
  isShopPrioritized: boolean;
};

export type PrioritizedBrandsResponse = {
  brandIds: string[];
  brands: PrioritizedBrand[];
};

export const adminShopSettingsApi = {
  getPrioritizedBrands: () =>
    apiFetch<{ success: true; data: PrioritizedBrandsResponse }>(
      "/api/admin/shop-settings/prioritized-brands",
      { method: "GET" },
    ),

  setPrioritizedBrands: (brandIds: string[]) =>
    apiFetch<{ success: true; data: PrioritizedBrandsResponse }>(
      "/api/admin/shop-settings/prioritized-brands",
      {
        method: "PUT",
        body: JSON.stringify({ brandIds }),
      },
    ),
};
