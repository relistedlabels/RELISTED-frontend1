import { useQuery } from "@tanstack/react-query";
import { closetApi, type PublicClosetDetail } from "@/lib/api/closet";

export const usePublicClosets = (options?: {
  limit?: number;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["closets", "public", options?.limit ?? 12],
    queryFn: async (): Promise<PublicClosetDetail[]> => {
      const res = await closetApi.listPublic(options?.limit ?? 12);
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
