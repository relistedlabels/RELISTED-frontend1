import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useDisputeStats = () =>
  useQuery({
    queryKey: ["renters", "disputes", "stats"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeStats();
      return response.data.disputeStats;
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
      return response.data.dispute;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });

export const useDisputeOverview = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId, "overview"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeOverview(disputeId);
      return response.data.overview;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });

export const useDisputeEvidence = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId, "evidence"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeEvidence(disputeId);
      return response.data.evidence;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });

export const useDisputeTimeline = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId, "timeline"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeTimeline(disputeId);
      return response.data.timeline;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });

export const useDisputeResolution = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId, "resolution"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeResolution(disputeId);
      return response.data.resolution;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });

export const useDisputeMessages = (disputeId: string) =>
  useQuery({
    queryKey: ["renters", "disputes", disputeId, "messages"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeMessages(disputeId);
      return response.data.messages;
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!disputeId,
  });
