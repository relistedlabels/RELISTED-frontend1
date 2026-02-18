// lib/api/public.ts - Public API endpoints (no authentication required)
import { apiFetch } from "./http";

// ============================================================================
// PRODUCT TYPES
// ============================================================================
export type PublicProductBrand = {
  id: string;
  name: string;
};

export type PublicProductCategory = {
  id: string;
  name: string;
};

export type PublicProductLister = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
};

export type PublicProduct = {
  id: string;
  name: string;
  brand: PublicProductBrand;
  category: PublicProductCategory;
  condition: string;
  dailyPrice: number;
  currency: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  lister: PublicProductLister;
  isInStock: boolean;
  availableCount: number;
};

export type PublicProductDetail = PublicProduct & {
  description: string;
  color: string;
  size: string;
  composition: string;
  measurements: string;
  securityDeposit: number;
  reviewCount: number;
  productReviews: Array<{
    reviewId: string;
    renterName: string;
    rating: number;
    text: string;
    date: string;
  }>;
  relatedProducts: Array<{
    id: string;
    name: string;
    dailyPrice: number;
    image: string;
  }>;
};

export type PublicProductsResponse = {
  success: boolean;
  data: {
    products: PublicProduct[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
};

export type PublicProductDetailResponse = {
  success: boolean;
  data: {
    product: PublicProductDetail;
  };
};

// ============================================================================
// AVAILABILITY TYPES
// ============================================================================
export type PublicAvailabilityResponse = {
  success: boolean;
  data: {
    availability: {
      productId: string;
      productName: string;
      dailyPrice: number;
      currency: string;
      availableDates: string[];
      unavailableDates: string[];
      monthAvailability: {
        [key: string]: {
          total: number;
          available: number;
          unavailable: number;
          percentAvailable: number;
        };
      };
      calendarData: Array<{
        date: string;
        available: boolean;
        dayOfWeek: string;
        bookedBy: string | null;
      }>;
      minRentalDays: number;
      maxConsecutitiveDays: number;
      nextUnavailableFrom: string;
      checkDateFrom: string;
      checkDateTo: string;
    };
  };
};

// ============================================================================
// BRAND TYPES
// ============================================================================
export type PublicBrand = {
  id: string;
  name: string;
  logo: string;
};

export type PublicBrandsResponse = {
  success: boolean;
  data: {
    brands: PublicBrand[];
  };
};

// ============================================================================
// CATEGORY TYPES
// ============================================================================
export type PublicCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
};

export type PublicCategoriesResponse = {
  success: boolean;
  data: {
    categories: PublicCategory[];
  };
};

// ============================================================================
// USER/LISTER TYPES
// ============================================================================
export type PublicUser = {
  id: string;
  name: string;
  avatar: string;
  role: "lister" | "renter";
  rating: number;
  reviewCount: number;
  shopDescription: string;
  itemCount: number;
  joined: string;
  isVerified: boolean;
  featured: boolean;
};

export type PublicUserDetail = PublicUser & {
  bio: string;
  verificationDate: string;
  shopPolicies: {
    returnPolicy: string;
    deliveryTime: string;
    cancellationPolicy: string;
  };
  featuredProducts: Array<{
    id: string;
    name: string;
    dailyPrice: number;
    image: string;
  }>;
  recentReviews: Array<{
    reviewId: string;
    renterName: string;
    rating: number;
    text: string;
    date: string;
  }>;
};

export type PublicUsersResponse = {
  success: boolean;
  data: PublicUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
};

export type PublicUserDetailResponse = {
  success: boolean;
  data: {
    user: PublicUserDetail;
  };
};

// ============================================================================
// REVIEW TYPES
// ============================================================================
export type PublicReview = {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  image: string;
  date: string;
  verified: boolean;
};

export type PublicReviewsResponse = {
  success: boolean;
  data: {
    reviews: PublicReview[];
    summary: {
      totalReviews: number;
      averageRating: number;
      fiveStarCount: number;
      verified_reviews_percentage: number;
    };
  };
};

// ============================================================================
// CONTACT TYPES
// ============================================================================
export type ContactSubmitResponse = {
  success: boolean;
  message: string;
  data: {
    ticketId: string;
    submittedAt: string;
    status: string;
  };
};

// ============================================================================
// SEARCH TYPES
// ============================================================================
export type PublicSearchResult =
  | {
      type: "product";
      id: string;
      name: string;
      image: string;
      lister: string;
      price: number;
    }
  | {
      type: "brand";
      id: string;
      name: string;
      image: string;
    }
  | {
      type: "lister";
      id: string;
      name: string;
      avatar: string;
    };

export type PublicSearchResponse = {
  success: boolean;
  data: {
    results: PublicSearchResult[];
  };
};

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================
export const publicApi = {
  // Products
  getProducts: (params?: {
    page?: number;
    limit?: number;
    sort?:
      | "newest"
      | "oldest"
      | "price_low"
      | "price_high"
      | "popular"
      | "rating";
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    gender?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.brand) queryParams.append("brand", params.brand);
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.condition) queryParams.append("condition", params.condition);
    if (params?.gender) queryParams.append("gender", params.gender);
    if (params?.search) queryParams.append("search", params.search);

    const url = queryParams.toString()
      ? `/api/public/products?${queryParams.toString()}`
      : "/api/public/products";

    return apiFetch<PublicProductsResponse>(url, { method: "GET" });
  },

  getProductById: (id: string) =>
    apiFetch<PublicProductDetailResponse>(`/api/public/products/${id}`, {
      method: "GET",
    }),

  getProductAvailability: (
    id: string,
    params?: {
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = queryParams.toString()
      ? `/api/public/products/${id}/availability?${queryParams.toString()}`
      : `/api/public/products/${id}/availability`;

    return apiFetch<PublicAvailabilityResponse>(url, { method: "GET" });
  },

  // Brands
  getBrands: () =>
    apiFetch<PublicBrandsResponse>("/api/public/brands", { method: "GET" }),

  // Categories
  getCategories: () =>
    apiFetch<PublicCategoriesResponse>("/api/public/categories", {
      method: "GET",
    }),

  // Users/Listers
  getUsers: (params?: {
    page?: number;
    limit?: number;
    sort?: "rating" | "newest" | "popularity";
    search?: string;
    role?: "lister" | "renter";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const url = queryParams.toString()
      ? `/api/public/users?${queryParams.toString()}`
      : "/api/public/users";

    return apiFetch<PublicUsersResponse>(url, { method: "GET" });
  },

  getUserById: (id: string) =>
    apiFetch<PublicUserDetailResponse>(`/api/public/users/${id}`, {
      method: "GET",
    }),

  getUserProducts: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: "newest" | "price_low" | "price_high" | "rating";
      category?: string;
      search?: string;
    },
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const url = queryParams.toString()
      ? `/api/public/users/${userId}/products?${queryParams.toString()}`
      : `/api/public/users/${userId}/products`;

    return apiFetch<PublicProductsResponse>(url, { method: "GET" });
  },

  getUserReviews: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: "newest" | "oldest" | "rating_high" | "rating_low";
    },
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = queryParams.toString()
      ? `/api/public/users/${userId}/reviews?${queryParams.toString()}`
      : `/api/public/users/${userId}/reviews`;

    return apiFetch<any>(url, { method: "GET" });
  },

  // Reviews
  getReviews: (params?: {
    minRating?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "helpful";
    type?: "product" | "lister" | "general";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.minRating)
      queryParams.append("minRating", params.minRating.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.type) queryParams.append("type", params.type);

    const url = queryParams.toString()
      ? `/api/public/reviews?${queryParams.toString()}`
      : "/api/public/reviews";

    return apiFetch<PublicReviewsResponse>(url, { method: "GET" });
  },

  // Search
  search: (
    query: string,
    params?: {
      type?: "product" | "brand" | "lister" | "all";
      limit?: number;
    },
  ) => {
    const queryParams = new URLSearchParams();
    queryParams.append("query", query);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    return apiFetch<PublicSearchResponse>(
      `/api/public/search?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );
  },

  // Contact
  submitContact: (data: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }) =>
    apiFetch<ContactSubmitResponse>("/api/public/contact-us", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
