import { apiFetch } from "../http";

export type AdminReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  hiddenAt: string | null;
  createdAt: string;
  product: { id: string; name: string };
  renter: { id: string; name: string };
  lister: { id: string; name: string };
};

export const adminReviewsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    visibility?: "all" | "visible" | "hidden";
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.visibility) query.set("visibility", params.visibility);
    const qs = query.toString();
    return apiFetch<{
      success: boolean;
      data: {
        reviews: AdminReviewRow[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
        };
      };
    }>(`/api/admin/reviews${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  setVisibility: (reviewId: string, hidden: boolean) =>
    apiFetch<{ success: boolean }>(`/api/admin/reviews/${reviewId}/visibility`, {
      method: "PUT",
      body: JSON.stringify({ hidden }),
    }),

  remove: (reviewId: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
    }),
};
