import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  availabilityRequestsApi,
  type AvailabilityRequestListParams,
} from "@/lib/api/admin/availabilityRequests";

export const useAvailabilityRequests = (
  params: AvailabilityRequestListParams = {},
) =>
  useQuery({
    queryKey: [
      "admin",
      "availability-requests",
      params.page,
      params.limit,
      params.status,
      params.type,
      params.search,
      params.dateFrom,
      params.dateTo,
    ],
    queryFn: () => availabilityRequestsApi.getRequests(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 1,
  });

export const useAvailabilityRequestById = (
  requestId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "availability-requests", requestId],
    queryFn: () => availabilityRequestsApi.getById(requestId),
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!requestId && enabled,
  });

export const useAvailabilityRequestStats = () =>
  useQuery({
    queryKey: ["admin", "availability-requests", "stats"],
    queryFn: () => availabilityRequestsApi.getStats(),
    staleTime: 60 * 1000,
    retry: 1,
  });
