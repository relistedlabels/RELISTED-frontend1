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
  color: string;
  size: string;
  condition: string;
  material: string | null;
  tagNames: string[];
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
    category?: string;
    brand?: string | string[];
    tags?: string;
    listingType?: string;
    lister?: string | string[];
    color?: string;
    size?: string;
    condition?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    inCloset?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.saleId) q.set("saleId", params.saleId);
    if (params.category) q.set("category", params.category);
    if (params.tags) q.set("tags", params.tags);
    if (params.listingType) q.set("listingType", params.listingType);
    if (params.color) q.set("color", params.color);
    if (params.size) q.set("size", params.size);
    if (params.condition) q.set("condition", params.condition);
    if (params.material) q.set("material", params.material);
    if (params.minPrice !== undefined) q.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) q.set("maxPrice", String(params.maxPrice));
    if (params.inCloset === true) q.set("inCloset", "true");
    if (params.inCloset === false) q.set("inCloset", "false");
    if (Array.isArray(params.brand)) {
      params.brand.forEach((brand) => q.append("brand", brand));
    }
    if (Array.isArray(params.lister)) {
      params.lister.forEach((id) => q.append("lister", id));
    }
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

  getPickerFilterOptions: () =>
    apiFetch<{
      success: true;
      data: import("@/lib/shop/listingFilterOptions").ListingFilterOptions;
    }>("/api/admin/shop-sales/picker/filter-options", { method: "GET" }),

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
