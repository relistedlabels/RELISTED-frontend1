import { apiFetch } from "../http";
import { buildProductAvailabilityPath } from "../../admin/listingDeactivate";

export interface ProductStats {
  getTotalProducts: { count: number };
  getPendingProducts: { count: number; products?: any[] };
  getApprovedProducts: { count: number; products?: any[] };
  getRejectedProducts: { count: number; products?: any[] };
  getActiveProducts: { count: number; products?: any[] };
  getRentedProducts?: { count: number; products?: any[] };
  getInactiveProducts?: { count: number; products?: any[] };
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
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  profile?: {
    avatar?: string | null;
    avatarUpload?: { url: string } | null;
  } | null;
}

export interface Product {
  id: string;
  name: string;
  subText: string;
  category: string | { id: string; name: string };
  image: string;
  attachments?: {
    uploads: { id?: string; url: string }[];
  } | null;
  condition: string;
  originalValue: number;
  dailyPrice: number;
  quantity: number;
  status: string;
  dateAdded: string;
  listerName: string;
  curator?: Curator;
  curatorId?: string;
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

export interface AvailabilityCalendarEntry {
  date: string;
  status: "available" | "rented";
  booking?: {
    id: string;
    dresserId: string;
    dresserName: string;
    startDate: string;
    endDate: string;
    orderTotal: number;
  };
}

export interface ProductAvailability {
  productId: string;
  month: number;
  year: number;
  nextAvailableDate: string | null;
  currentlyRented: boolean;
  currentRentalEndDate: string | null;
  stats: {
    daysRentedThisMonth: number;
    totalRentalsThisMonth: number;
    totalRentalRevenue: number;
  };
  calendar: AvailabilityCalendarEntry[];
}

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
}

export interface ProductActivityEntry {
  id: string;
  type:
    | "listed"
    | "approved"
    | "rejected"
    | "rented"
    | "returned"
    | "damaged"
    | "updated"
    | "suspended"
    | "reactivated";
  title: string;
  description: string;
  timestamp: string;
  actor: ActivityActor | null;
  metadata?: {
    orderId?: string;
    endDate?: string;
    rejectionReason?: string;
  };
}

export interface ProductActivityResponse {
  productId: string;
  activities: ProductActivityEntry[];
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export type AdminProductListParams = {
  page?: number;
  count?: number;
  search?: string;
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
};

function appendAdminProductListParams(
  searchParams: URLSearchParams,
  params: AdminProductListParams,
) {
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.count ?? 20));
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params.category) searchParams.set("category", params.category);
  if (params.tags) searchParams.set("tags", params.tags);
  if (params.listingType) searchParams.set("listingType", params.listingType);
  if (params.color) searchParams.set("color", params.color);
  if (params.size) searchParams.set("size", params.size);
  if (params.condition) searchParams.set("condition", params.condition);
  if (params.material) searchParams.set("material", params.material);
  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", String(params.maxPrice));
  }
  if (Array.isArray(params.brand)) {
    params.brand.forEach((brand) => searchParams.append("brand", brand));
  }
  if (Array.isArray(params.lister)) {
    params.lister.forEach((id) => searchParams.append("lister", id));
  }
}

function buildAdminProductListQuery(params: AdminProductListParams): string {
  const searchParams = new URLSearchParams();
  appendAdminProductListParams(searchParams, params);
  return searchParams.toString();
}

export const productsApi = {
  // 1. GET /api/admin/products/statistics
  getStatistics: () =>
    apiFetch<{ success: true; data: ProductStats }>(
      "/api/admin/products/statistics",
    ),

  // 2. GET /api/admin/products/pending
  getPending: (params: AdminProductListParams) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/pending?${buildAdminProductListQuery(params)}`,
    ),

  // 3. GET /api/admin/products/active
  getActive: (params: AdminProductListParams) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/active?${buildAdminProductListQuery(params)}`,
    ),

  // 4. GET /api/admin/products/rejected
  getRejected: (params: AdminProductListParams) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/rejected?${buildAdminProductListQuery(params)}`,
    ),

  // 4b. GET /api/admin/products/rented
  getRented: (params: AdminProductListParams) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/rented?${buildAdminProductListQuery(params)}`,
    ),

  // 4c. GET /api/admin/products/inactive
  getInactive: (params: AdminProductListParams) =>
    apiFetch<{ success: true; data: PaginatedProductsResponse }>(
      `/api/admin/products/inactive?${buildAdminProductListQuery(params)}`,
    ),

  // 5. PATCH /api/admin/products/:productId/approve
  approveProduct: (productId: string) =>
    apiFetch<{ success: true; message: string; data: any }>(
      `/api/admin/products/${productId}/approve`,
      { method: "PATCH" },
    ),

  // 6. PATCH /api/admin/products/:productId/reject
  rejectProduct: (productId: string, rejectionComment: string) =>
    apiFetch<{ success: true; message: string; data: any }>(
      `/api/admin/products/${productId}/reject`,
      {
        method: "PATCH",
        body: JSON.stringify({ rejectionComment }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // PATCH /api/admin/products/:productId/pending
  sendProductToPending: (productId: string) =>
    apiFetch<{ success: true; message: string; data: any }>(
      `/api/admin/products/${productId}/pending`,
      { method: "PATCH" },
    ),

  // 7. PATCH /product/:productId/availability
  setAvailability: (productId: string, isAvailable: boolean) =>
    apiFetch<{ success: true; data: any }>(
      buildProductAvailabilityPath(productId),
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

  // 9. GET /api/admin/listings/:productId/availability
  getProductAvailability: (productId: string, month: number, year: number) =>
    apiFetch<{ success: true; data: ProductAvailability }>(
      `/api/admin/products/listings/${productId}/availability?month=${month}&year=${year}`,
    ),

  // 10. GET /api/admin/listings/:productId/activity
  getProductActivity: (productId: string) =>
    apiFetch<{ success: true; data: ProductActivityResponse }>(
      `/api/admin/products/listings/${productId}/activity`,
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

  // 28. POST /api/admin/products/bulk/deactivate
  bulkDeactivate: (productIds: string[]) =>
    apiFetch<{ success: true; message: string; count: number }>(
      "/api/admin/products/bulk/deactivate",
      {
        method: "POST",
        body: JSON.stringify({ productIds }),
        headers: { "Content-Type": "application/json" },
      },
    ),

  // 29. POST /api/admin/products/bulk/reactivate
  bulkReactivate: (productIds: string[]) =>
    apiFetch<{ success: true; message: string; count: number }>(
      "/api/admin/products/bulk/reactivate",
      {
        method: "POST",
        body: JSON.stringify({ productIds }),
        headers: { "Content-Type": "application/json" },
      },
    ),
};
