import { apiFetch } from "./http";
import type { ProductsResponse } from "./product";

export type ClosetOwnerPublic = {
  id: string;
  name: string;
  avatar: string | null;
};

export type PublicClosetDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  owner: ClosetOwnerPublic;
  publicProductCount: number;
};

export type ClosetRecord = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Integer Naira: running total of lister payout attributed to this closet (partner settlement). */
  closetWalletBalance?: number;
  productCount?: number;
};

export type ClosetListResponse = {
  success: boolean;
  message: string;
  data: ClosetRecord[];
};

export type ClosetDetailResponse = {
  success: boolean;
  message: string;
  data: ClosetRecord;
};

export type PublicClosetResponse = {
  success: boolean;
  message: string;
  data: PublicClosetDetail;
};

export type PublicClosetsListResponse = {
  success: boolean;
  message: string;
  data: PublicClosetDetail[];
};

export const closetApi = {
  listMine: () =>
    apiFetch<ClosetListResponse>("/closet", { method: "GET" }),

  create: (body: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) =>
    apiFetch<ClosetDetailResponse>("/closet", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    id: string,
    body: Partial<{
      name: string;
      slug: string;
      description: string;
      imageUrl: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ) =>
    apiFetch<ClosetDetailResponse>(`/closet/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deactivate: (id: string) =>
    apiFetch<ClosetDetailResponse>(`/closet/${id}`, {
      method: "DELETE",
    }),

  listPublic: (limit?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set("limit", String(limit));
    const qs = params.toString();
    return apiFetch<PublicClosetsListResponse>(
      `/api/public/closets${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
  },

  getPublicBySlug: (slug: string) =>
    apiFetch<PublicClosetResponse>(
      `/api/public/closets/${encodeURIComponent(slug)}`,
      { method: "GET" },
    ),

  getPublicProducts: (
    slug: string,
    filters?: {
      search?: string;
      category?: string[];
      tags?: string;
      brand?: string[];
      size?: string;
      minPrice?: number;
      maxPrice?: number;
      color?: string;
      condition?: string;
      material?: string;
      page?: number;
      limit?: number;
      sort?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category?.length)
      params.append("category", filters.category.join(","));
    if (filters?.tags) params.append("tags", filters.tags);
    if (filters?.brand?.length)
      params.append("brand", filters.brand.join(","));
    if (filters?.size) params.append("size", filters.size);
    if (filters?.minPrice !== undefined)
      params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice !== undefined)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.color) params.append("color", filters.color);
    if (filters?.condition) params.append("condition", filters.condition);
    if (filters?.material) params.append("material", filters.material);
    if (filters?.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters?.limit !== undefined)
      params.append("limit", filters.limit.toString());
    if (filters?.sort) params.append("sort", filters.sort);

    const qs = params.toString();
    const path = `/api/public/closets/${encodeURIComponent(slug)}/products${qs ? `?${qs}` : ""}`;
    return apiFetch<ProductsResponse>(path, { method: "GET" });
  },
};
