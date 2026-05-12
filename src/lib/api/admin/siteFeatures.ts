import { apiFetch } from "../http";

export type AdminSiteFeatures = {
  headerClosetsShopNavEnabled: boolean;
};

export const adminSiteFeaturesApi = {
  get: () =>
    apiFetch<{ success: true; data: AdminSiteFeatures }>(
      "/api/admin/site-features",
      { method: "GET" },
    ),

  update: (body: AdminSiteFeatures) =>
    apiFetch<{ success: true; data: AdminSiteFeatures }>(
      "/api/admin/site-features",
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),
};
