import { apiFetch } from "../http";

export type ShopBrand = {
  id: string;
  name: string;
  isShopVisible: boolean;
  isShopPrioritized: boolean;
  shopPriorityOrder: number | null;
};

export type PrioritizedBrand = ShopBrand;

export type PrioritizedBrandsResponse = {
  brandIds: string[];
  brands: PrioritizedBrand[];
};

export type VisibleBrandsResponse = {
  visibleBrandIds: string[];
  brands: ShopBrand[];
};

export type BrandRemovalWarning = {
  brandId: string;
  brandName: string;
  rentedSkipped: number;
};

export type SetVisibleBrandsResponse = {
  success: true;
  data: VisibleBrandsResponse;
  warnings?: BrandRemovalWarning[];
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

  getVisibleBrands: () =>
    apiFetch<{ success: true; data: VisibleBrandsResponse }>(
      "/api/admin/shop-settings/visible-brands",
      { method: "GET" },
    ),

  setVisibleBrands: (brandIds: string[]) =>
    apiFetch<SetVisibleBrandsResponse>(
      "/api/admin/shop-settings/visible-brands",
      {
        method: "PUT",
        body: JSON.stringify({ brandIds }),
      },
    ),
};
