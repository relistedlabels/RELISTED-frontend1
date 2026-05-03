import { useQuery } from "@tanstack/react-query";
import { closetApi, type ClosetRecord } from "@/lib/api/closet";

export const useMyClosets = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["closets", "mine"],
    queryFn: async (): Promise<ClosetRecord[]> => {
      const res = await closetApi.listMine();
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
