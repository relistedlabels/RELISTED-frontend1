import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { publicApi, PublicUserDetail } from "@/lib/api/public";

/**
 * Query hook for fetching lister/business profile by ID (GET /api/public/users/:id)
 */
export const useListerProfile = (
  listerId: string,
): UseQueryResult<PublicUserDetail, Error> => {
  return useQuery({
    queryKey: ["lister", "profile", listerId],
    queryFn: async () => {
      const response = await publicApi.getUserById(listerId);
      return response.data.user;
    },
    enabled: !!listerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
