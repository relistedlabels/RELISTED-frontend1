import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useDisputeStats = () =>
  useQuery({
    queryKey: ["renters", "disputes", "stats"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDisputes = (
  status: "all" | "pending" | "in_review" | "resolved" = "all",
  page = 1,
  limit = 20,
  sort: "newest" | "oldest" = "newest",
) =>
  useQuery({
    queryKey: ["renters", "disputes", status, page, limit, sort],
    queryFn: async () => {
      const response = await rentersApi.getDisputes({
        status,
        page,
        limit,
        sort,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDisputeDetails = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId],
    queryFn: async () => {
      const response = await rentersApi.getDisputeDetails(disputeId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });
