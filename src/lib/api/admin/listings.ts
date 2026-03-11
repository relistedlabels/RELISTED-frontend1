import { apiFetch } from "../http";

export interface ProductStats {
  getTotalProducts: { count: number };
  getPendingProducts: { count: number; products?: any[] };
  getApprovedProducts: { count: number; products?: any[] };
  getRejectedProducts: { count: number; products?: any[] };
  getActiveProducts: { count: number; products?: any[] };
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

export interface Curator {
  name: string;
  email: string;
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
  curator?: Curator;
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

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
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

export const productsApi = {
  // 1. GET /api/admin/products/statistics
  getStatistics: () =>
    apiFetch<{ success: true; data: ProductStats }>(
      "/api/admin/products/statistics",
    ),

  // 2. GET /api/admin/products/pending
  getPending: (params: { page?: number; count?: number }) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/pending?page=${params.page ?? 1}&count=${params.count ?? 20}`,
    ),

  // 3. GET /api/admin/products/active
  getActive: (params: { page?: number; count?: number }) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/active?page=${params.page ?? 1}&count=${params.count ?? 20}`,
    ),

  // 4. GET /api/admin/products/rejected
  getRejected: (params: { page?: number; count?: number }) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/rejected?page=${params.page ?? 1}&count=${params.count ?? 20}`,
    ),

  // 5. PATCH /api/admin/products/:productId/approve
  approveProduct: (productId: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/products/${productId}/approve`,
      { method: "PATCH" },
    ),

  // 6. PATCH /api/admin/products/:productId/reject
  rejectProduct: (productId: string, rejectionComment: string) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/products/${productId}/reject`,
      {
        method: "PATCH",
        body: JSON.stringify({ rejectionComment }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // 7. PATCH /api/admin/products/:productId/availability
  setAvailability: (productId: string, isAvailable: boolean) =>
    apiFetch<{ success: true; data: any }>(
      `/api/admin/products/${productId}/availability`,
      {
        method: "PATCH",
        body: JSON.stringify({ isAvailable }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // 8. DELETE /api/admin/products/:productId
  deleteProduct: (productId: string) =>
    apiFetch<{ success: true; message: string }>(
      `/api/admin/products/${productId}`,
      { method: "DELETE" },
    ),

  // GET /api/admin/products/:productId
  getProductById: (productId: string) =>
    apiFetch<{ success: true; data: ProductDetail }>(
      `/api/admin/products/${productId}`,
    ),

  // ...existing code...

  // 16. GET /categories
  getAllCategories: () => apiFetch<ListingCategory[]>("/categories"),

  // 17. POST /categories
  createCategory: (name: string, imageFile: File) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", imageFile);
    return apiFetch<{ success: true; data: ListingCategory }>(`/categories`, {
      method: "POST",
      body: formData,
    });
  },

  // 18. PATCH /categories/:categoryId
  editCategory: (categoryId: string, name: string, imageFile?: File) => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return apiFetch<{ success: true; data: ListingCategory }>(
      `/categories/${categoryId}`,
      {
        method: "PATCH",
        body: formData,
      },
    );
  },

  // 19. DELETE /categories/:categoryId
  deleteCategory: (categoryId: string) =>
    apiFetch<{ success: true; message: string }>(`/categories/${categoryId}`, {
      method: "DELETE",
    }),

  // 20. GET /tags
  getAllTags: () => apiFetch<ListingTag[]>("/tags"),

  // 21. POST /tags
  createTag: (name: string) =>
    apiFetch<{ success: true; data: ListingTag }>(`/tags`, {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    }),

  // 22. PATCH /tags/:tagId
  editTag: (tagId: string, name: string) =>
    apiFetch<{ success: true; data: ListingTag }>(`/tags/${tagId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    }),

  // 23. DELETE /tags/:tagId
  deleteTag: (tagId: string) =>
    apiFetch<{ success: true; message: string }>(`/tags/${tagId}`, {
      method: "DELETE",
    }),

  // 24. GET /brands
  getAllBrands: () => apiFetch<ListingBrand[]>("/brands"),

  // 25. POST /brands
  createBrand: (name: string) =>
    apiFetch<{ success: true; data: ListingBrand }>(`/brands`, {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    }),

  // 26. PATCH /brands/:brandId
  editBrand: (brandId: string, name: string) =>
    apiFetch<{ success: true; data: ListingBrand }>(`/brands/${brandId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    }),

  // 27. DELETE /brands/:brandId
  deleteBrand: (brandId: string) =>
    apiFetch<{ success: true; message: string }>(`/brands/${brandId}`, {
      method: "DELETE",
    }),
};
