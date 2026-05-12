import { useQuery } from "@tanstack/react-query";
import { adminClosetsApi } from "@/lib/api/admin/closets";

export function useAdminClosets(params: {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "admin",
      "closets",
      params.page,
      params.limit,
      params.search ?? "",
    ],
    queryFn: () =>
      adminClosetsApi.list({
        page: params.page,
        limit: params.limit,
        search: params.search,
      }),
    staleTime: 60 * 1000,
    retry: 1,
    enabled: params.enabled !== false,
  });
}

export function useAdminClosetDetail(
  closetId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["admin", "closets", closetId],
    queryFn: () => adminClosetsApi.getById(closetId!),
    staleTime: 60 * 1000,
    retry: 1,
    enabled: Boolean(closetId) && enabled,
  });
}
