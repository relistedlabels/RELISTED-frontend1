import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useOrderDetails = (orderId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "orders", orderId],
    queryFn: async () => {
      const response = await rentersApi.getOrderDetails(orderId);
      return response.data.order;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!orderId && token !== null,
  });
};

export const useOrderProgress = (orderId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "orders", orderId, "progress"],
    queryFn: async () => {
      const response = await rentersApi.getOrderProgress(orderId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: !!orderId && token !== null,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for updates
  });
};
