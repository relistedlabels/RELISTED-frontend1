import { apiFetch } from "./http";

export const newsletterApi = {
  // POST /api/newsletter/subscribe - User signs up for newsletter
  subscribe: (data: { email: string }) =>
    apiFetch<{
      success: boolean;
      message: string;
    }>("/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // POST /api/newsletter/unsubscribe - User opts out of newsletter
  unsubscribe: (data: { email: string }) =>
    apiFetch<{
      success: boolean;
      message: string;
    }>("/api/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/admin/newsletter/subscribers - Admin gets all newsletter subscribers
  getSubscribers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    return apiFetch<{
      success: boolean;
      data: {
        subscribers: {
          id: string;
          email: string;
          subscribedAt: string;
          isActive: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
      };
    }>(
      `/api/admin/newsletter/subscribers${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    );
  },
};
