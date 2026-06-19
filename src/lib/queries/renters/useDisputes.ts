import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useDisputeStats = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", "stats"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeStats();
      return response.data.disputeStats;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: token !== null,
  });
};

export const useDisputes = (
  status: "all" | "pending" | "in_review" | "resolved" = "all",
  page = 1,
  limit = 20,
  sort: "newest" | "oldest" = "newest",
) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
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
    enabled: token !== null,
  });
};

export const useDisputeDetails = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId],
    queryFn: async () => {
      const response = await rentersApi.getDisputeDetails(disputeId);
      return response.data.dispute;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};

export const useDisputeOverview = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId, "overview"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeOverview(disputeId);
      return response.data.overview;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};

export const useDisputeEvidence = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId, "evidence"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeEvidence(disputeId);
      return response.data.evidence;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};

export const useDisputeTimeline = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId, "timeline"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeTimeline(disputeId);
      return response.data.timeline;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};

export const useDisputeResolution = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId, "resolution"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeResolution(disputeId);
      return response.data.resolution;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};

export const useDisputeMessages = (disputeId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "disputes", disputeId, "messages"],
    queryFn: async () => {
      const response = await rentersApi.getDisputeMessages(disputeId);
      return response.data.messages;
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!disputeId && token !== null,
  });
};
