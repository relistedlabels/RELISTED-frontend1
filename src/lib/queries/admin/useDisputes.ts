import { useQuery } from "@tanstack/react-query";
import { disputesApi } from "@/lib/api/admin/";

interface DisputesListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useDisputeStats = () =>
  useQuery({
    queryKey: ["admin", "disputes", "stats"],
    queryFn: () => disputesApi.getStats(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDisputes = (params: DisputesListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "disputes",
      params.status,
      params.search,
      params.page,
      params.limit,
    ],
    queryFn: () => disputesApi.getDisputes(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDisputeById = (disputeId: string) =>
  useQuery({
    queryKey: ["admin", "disputes", disputeId],
    queryFn: () => disputesApi.getDisputeById(disputeId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });
