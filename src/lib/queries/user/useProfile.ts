// lib/queries/profile/useProfile.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/lib/api/profile";
import { FullProfile } from "@/types/profile";

/**
 * Hook to fetch user profile data from server
 * Does NOT store in local Zustand state
 * Always fetches fresh data from server via React Query cache
 */
export const useProfile = () => {
  return useQuery<FullProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      return await getProfile();
    },
    retry: false,
  });
};

/**
 * Helper to invalidate profile cache and refetch
 * Call this after profile updates
 */
export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["profile"] });
};
