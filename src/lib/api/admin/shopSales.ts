import { apiFetch } from "../http";

export type ShopSalePhase = "off" | "upcoming" | "live" | "ended";

export type AdminShopSaleRow = {
  id: string;
  slug: string;
  internalName: string;
  headline: string;
  subheadline: string | null;
  shopTitle: string;
  shopDescription: string | null;
  preSaleMessage: string | null;
  startsAt: string;
  endsAt: string;
  earliestDeliveryAt: string | null;
  isEnabled: boolean;
  bannerEnabled: boolean;
  waitlistEnabled: boolean;
  shopAccessEnabled: boolean;
  showCountdown: boolean;
  notifyEmailSubject: string | null;
  notifyEmailBody: string | null;
  phase: ShopSalePhase;
  productCount: number;
  waitlistCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminShopSaleProduct = {
  id: string;
  name: string;
  status: string;
  listingType: string;
  dailyPrice: number | null;
  resalePrice: number | null;
  listerName: string;
  listerEmail: string;
  brandName: string | null;
  imageUrl: string | null;
};

export type AdminShopSaleDetail = AdminShopSaleRow & {
  products: AdminShopSaleProduct[];
};

export type AdminShopSalePickerProduct = {
  id: string;
  name: string;
  status: string;
  listingType: string;
  dailyPrice: number | null;
  resalePrice: number | null;
  inCloset: boolean;
  listerName: string;
  listerEmail: string;
  brandName: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  inSale: boolean;
};

export type ShopSaleFormPayload = {
  internalName: string;
  slug?: string;
  headline: string;
  subheadline?: string;
  shopTitle: string;
  shopDescription?: string;
  preSaleMessage?: string;
  startsAt: string;
  endsAt: string;
  earliestDeliveryAt?: string | null;
  isEnabled?: boolean;
  bannerEnabled?: boolean;
  waitlistEnabled?: boolean;
  shopAccessEnabled?: boolean;
  showCountdown?: boolean;
  notifyEmailSubject?: string;
  notifyEmailBody?: string;
};

export type AdminShopSaleWaitlistEntry = {
  id: string;
  email: string;
  joinedAt: string;
  userName: string | null;
};

export const adminShopSalesApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<{
      success: true;
      data: {
        sales: AdminShopSaleRow[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/api/admin/shop-sales?page=${page}&limit=${limit}`),

  get: (saleId: string) =>
    apiFetch<{ success: true; data: AdminShopSaleDetail }>(
      `/api/admin/shop-sales/${saleId}`,
    ),

  create: (payload: ShopSaleFormPayload) =>
    apiFetch<{ success: true; data: AdminShopSaleRow }>(
      "/api/admin/shop-sales",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  update: (saleId: string, payload: Partial<ShopSaleFormPayload>) =>
    apiFetch<{ success: true; data: AdminShopSaleRow }>(
      `/api/admin/shop-sales/${saleId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),

  setEnabled: (saleId: string, isEnabled: boolean) =>
    apiFetch<{ success: true; data: AdminShopSaleRow }>(
      `/api/admin/shop-sales/${saleId}/enabled`,
      { method: "PATCH", body: JSON.stringify({ isEnabled }) },
    ),

  setProducts: (saleId: string, productIds: string[]) =>
    apiFetch<{ success: true; data: AdminShopSaleDetail }>(
      `/api/admin/shop-sales/${saleId}/products`,
      { method: "PUT", body: JSON.stringify({ productIds }) },
    ),

  searchProducts: (params: {
    search?: string;
    page?: number;
    limit?: number;
    saleId?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.saleId) q.set("saleId", params.saleId);
    return apiFetch<{
      success: true;
      data: {
        products: AdminShopSalePickerProduct[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/api/admin/shop-sales/picker/products?${q.toString()}`);
  },

  waitlist: (saleId: string, page = 1, limit = 20) =>
    apiFetch<{
      success: true;
      data: {
        entries: AdminShopSaleWaitlistEntry[];
        total: number;
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/shop-sales/${saleId}/waitlist?page=${page}&limit=${limit}`),

  notifyWaitlist: (saleId: string) =>
    apiFetch<{
      success: true;
      data: {
        sent: number;
        failed: { email: string; error: string }[];
      };
    }>(`/api/admin/shop-sales/${saleId}/notify-waitlist`, { method: "POST" }),
};
