import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export function useVerificationStatus() {
  return useQuery({
    queryKey: ["renters", "verification", "status"],
    queryFn: async () => {
      const response = await rentersApi.getVerificationsStatus();
      return response.data.verifications;
    },
    staleTime: 0, // Always fetch fresh
    retry: 1,
  });
}
