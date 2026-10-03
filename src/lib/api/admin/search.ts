import { apiFetch } from "../http";

export interface AdminSearchResult {
  id: string;
  type: "order" | "user" | "listing" | "dispute" | "review" | "request";
  title: string;
  subtitle?: string;
  href: string;
  avatar?: string | null;
}

export interface AdminSearchResponse {
  success: boolean;
  data: {
    results: AdminSearchResult[];
  };
}

export const adminSearchApi = {
  search: async (
    query: string,
    params?: { limit?: number },
  ): Promise<AdminSearchResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append("query", query);
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }

    return apiFetch(`/api/admin/search?${searchParams.toString()}`);
  },
};
