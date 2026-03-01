import { apiFetch } from "../http";

export interface ListingStats {
  getTotalProducts: { count: number };
  getPendingProducts: { count: number };
  getApprovedProducts: { count: number };
  getRejectedProducts: { count: number };
  getActiveProducts: { count: number };
}

export interface ListingCategory {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ListingTag {
  id: string;
  name: string;
}

export interface ListingBrand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  subText: string;
  category: string;
  image: string;
  condition: string;
  originalValue: number;
  dailyPrice: number;
  quantity: number;
  status: string;
  dateAdded: string;
  listerName: string;
  productVerified: boolean;
}

export interface ProductDetail extends Product {
  description: string;
  composition: string;
  color: string;
  careInstruction: string;
  stylingTip: string;
  attachments: {
    uploads: { id: string; url: string }[];
  };
  listerEmail: string;
  listerPhone: string;
}

interface ListParams {
  status?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

function buildListParams(params: ListParams): string {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append("status", params.status);
  if (params.search) searchParams.append("search", params.search);
  if (params.category) searchParams.append("category", params.category);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  return searchParams.toString();
}

export const listingsApi = {
  // 9. GET /api/admin/listings/statistics
  getStatistics: () =>
    apiFetch<{ success: true; data: ListingStats }>(
      "/api/admin/listings/statistics",
    ),

  // 10. GET /api/admin/listings/categories
  getCategories: () =>
    apiFetch<{ success: true; data: ListingCategory[] }>(
      "/api/admin/listings/categories",
    ),

  // 11. GET /api/admin/listings?status=...&search=...&category=...&page=...&limit=...
  getListings: (params: ListParams) =>
    apiFetch<{
      success: true;
      data: {
        products: Product[];
        total: number;
        page: number;
        limit: number;
      };
    }>(`/api/admin/listings?${buildListParams(params)}`),

  // 12. GET /api/admin/listings/:productId
  getProductById: (productId: string) =>
    apiFetch<{ success: true; data: ProductDetail }>(
      `/api/admin/listings/${productId}`,
    ),

  // 13. PATCH /api/admin/listings/:productId/approve
  approveProduct: (productId: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/listings/${productId}/approve`,
      { method: "PATCH" },
    ),

  // 14. PATCH /api/admin/listings/:productId/reject
  rejectProduct: (productId: string, rejectionComment: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/listings/${productId}/reject`,
      {
        method: "PATCH",
        body: JSON.stringify({ rejectionComment }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // 15. GET /api/admin/listings/export?status=...&search=...&category=...
  exportListings: (params: ListParams) =>
    apiFetch<Blob>(`/api/admin/listings/export?${buildListParams(params)}`),

  // 16. GET /api/admin/categories
  getAllCategories: () =>
    apiFetch<{ success: true; data: ListingCategory[] }>(
      "/api/admin/categories",
    ),

  // 17. PATCH /api/admin/categories/:categoryId
  editCategory: (categoryId: string, name: string, imageFile?: File) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return apiFetch<{ success: true; data: ListingCategory }>(
      `/api/admin/categories/${categoryId}`,
      {
        method: "PATCH",
        body: formData,
      },
    );
  },

  // 18. DELETE /api/admin/categories/:categoryId
  deleteCategory: (categoryId: string) =>
    apiFetch<{ success: true; message: string }>(
      `/api/admin/categories/${categoryId}`,
      { method: "DELETE" },
    ),

  // 19. GET /api/admin/tags
  getAllTags: () =>
    apiFetch<{ success: true; data: ListingTag[] }>("/api/admin/tags"),

  // 20. PATCH /api/admin/tags/:tagId
  editTag: (tagId: string, name: string) =>
    apiFetch<{ success: true; data: ListingTag }>(`/api/admin/tags/${tagId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    }),

  // 21. DELETE /api/admin/tags/:tagId
  deleteTag: (tagId: string) =>
    apiFetch<{ success: true; message: string }>(`/api/admin/tags/${tagId}`, {
      method: "DELETE",
    }),

  // 22. GET /api/admin/brands
  getAllBrands: () =>
    apiFetch<{ success: true; data: ListingBrand[] }>("/api/admin/brands"),

  // 23. PATCH /api/admin/brands/:brandId
  editBrand: (brandId: string, name: string) =>
    apiFetch<{ success: true; data: ListingBrand }>(
      `/api/admin/brands/${brandId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // 24. DELETE /api/admin/brands/:brandId
  deleteBrand: (brandId: string) =>
    apiFetch<{ success: true; message: string }>(
      `/api/admin/brands/${brandId}`,
      { method: "DELETE" },
    ),
};
