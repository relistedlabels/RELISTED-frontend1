// lib/api/product.ts
import { apiFetch } from "./http";

export type ProductUpload = {
  id: string;
  url: string;
};

export type ProductAttachment = {
  id: string;
  uploads: ProductUpload[];
} | null;

export type ProductCurator = {
  name: string;
  id: string;
  email: string;
};

export type UserProduct = {
  id: string;
  name: string;
  subText: string;
  description: string;
  condition: string;
  productVerified: boolean;
  dailyPrice: number;
  isActive: boolean;
  quantity: number;
  status: "APPROVED" | "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED";
  composition: string;
  measurement: string;
  originalValue: number;
  warning: string;
  color: string;
  brandId: string | null;
  brand: {
    id: string;
    name: string;
    userId?: string;
    createdAt?: string;
  } | null;
  categoryId: string | null;
  tagId: string | null;
  curatorId: string;
  receiveSmsNotifications: boolean;
  receiveEmailNotifications: boolean;
  receiveProductRecommendations: boolean;
  careInstruction: string;
  careSteps: string;
  stylingTip: string;
  createdAt: string;
  updatedAt: string;
  attachments: ProductAttachment | null;
  curator: ProductCurator;
};

export type ProductPayload = {
  name: string;
  subText: string;
  description: string;
  condition: string;
  composition: string;
  measurement: string;
  originalValue: number;
  dailyPrice: number;
  quantity: number;
  color: string;
  warning: string;
  careInstruction: string;
  careSteps?: string;
  stylingTip: string;
  attachments: string[];
  categoryId: string;
  tagId: string;
  brandId: string;
};

export type ProductResponse = {
  message: string;
};

export type UserProductsResponse = {
  success: boolean;
  message: string;
  data: UserProduct[];
};

export type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ProductsResponse = {
  success: boolean;
  message: string;
  data: {
    products: UserProduct[];
    pagination?: PaginationData;
  };
};

export type ProductStatistics = {
  getTotalProducts: { count: number; products: UserProduct[] };
  getApprovedProducts: { count: number; products: UserProduct[] };
  getRejectedProducts: { count: number; products: UserProduct[] };
  getPendingProducts: { count: number; products: UserProduct[] };
  getActiveProducts: { count: number; products: UserProduct[] };
};

export type ProductStatisticsResponse = {
  success: boolean;
  message: string;
  data: ProductStatistics;
};

export const productApi = {
  deleteProduct: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: "DELETE",
    }),
  create: (data: ProductPayload) =>
    apiFetch<ProductResponse>("/product", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Public API - Browse products (no auth required)
  getAll: (filters?: {
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
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category?.length)
      params.append("category", filters.category.join(","));
    if (filters?.tags) params.append("tags", filters.tags);
    if (filters?.brand?.length) params.append("brand", filters.brand.join(","));
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

    const queryString = params.toString();
    const url = queryString
      ? `/api/public/products?${queryString}`
      : "/api/public/products";

    return apiFetch<ProductsResponse>(url, {
      method: "GET",
    });
  },

  // Public API - Get single product details
  getPublicById: (id: string) =>
    apiFetch<{ success: boolean; data: UserProduct }>(
      `/api/public/products/${id}`,
      {
        method: "GET",
      },
    ),

  // Authenticated API - Get user's own product
  getById: (id: string) =>
    apiFetch<UserProduct>(`/product/${id}`, {
      method: "GET",
    }),

  update: (id: string, data: Partial<ProductPayload>) =>
    apiFetch<ProductResponse>(`/product/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<ProductResponse>(`/product/${id}`, {
      method: "DELETE",
    }),

  getUserProducts: () =>
    apiFetch<UserProductsResponse>("/product/user-products", {
      method: "GET",
    }),

  getStatistics: () =>
    apiFetch<ProductStatisticsResponse>("/admin/products/statistics", {
      method: "GET",
    }),

  // Admin product management
  getPendingProducts: (page: number = 1, count: number = 10) =>
    apiFetch<ProductsResponse>(
      `/admin/products/pending?page=${page}&count=${count}`,
      {
        method: "GET",
      },
    ),

  getApprovedProducts: (page: number = 1, count: number = 10) =>
    apiFetch<ProductsResponse>(
      `/admin/products/approved?page=${page}&count=${count}`,
      {
        method: "GET",
      },
    ),

  getRejectedProducts: (page: number = 1, count: number = 10) =>
    apiFetch<ProductsResponse>(
      `/admin/products/rejected?page=${page}&count=${count}`,
      {
        method: "GET",
      },
    ),

  approveProduct: (id: string) =>
    apiFetch<ProductResponse>(`/admin/products/${id}/approve`, {
      method: "PATCH",
    }),

  rejectProduct: (id: string, rejectionComment: string) =>
    apiFetch<ProductResponse>(`/admin/products/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejectionComment }),
    }),

  toggleAvailability: (id: string, isAvailable: boolean) =>
    apiFetch<ProductResponse>(`/admin/products/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),
};
