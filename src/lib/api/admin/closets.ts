import { apiFetch } from "../http";

export type AdminClosetOwner = {
  id: string;
  name: string;
  email: string;
};

export type AdminClosetListRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  closetWalletBalance: number;
  createdAt: string;
  updatedAt: string;
  owner: AdminClosetOwner;
  productCount: number;
};

export type AdminClosetProductRow = {
  id: string;
  name: string;
  status: string;
  listingType: string;
  isActive: boolean;
  dailyPrice: number | null;
  resalePrice: number | null;
  productVerified: boolean;
  imageUrl: string | null;
};

export type AdminClosetDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  closetWalletBalance: number;
  createdAt: string;
  updatedAt: string;
  owner: AdminClosetOwner & { role: string };
  products: AdminClosetProductRow[];
};

function buildClosetListParams(params: {
  page?: number;
  limit?: number;
  search?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const adminClosetsApi = {
  list: (params: { page?: number; limit?: number; search?: string } = {}) =>
    apiFetch<{
      success: true;
      data: {
        closets: AdminClosetListRow[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`/api/admin/closets${buildClosetListParams(params)}`),

  getById: (closetId: string) =>
    apiFetch<{ success: true; data: AdminClosetDetail }>(
      `/api/admin/closets/${encodeURIComponent(closetId)}`,
    ),
};
