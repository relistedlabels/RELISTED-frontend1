import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

// GET /api/renters/profile - Retrieve renter profile information
export const useProfileDetails = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renter-profile-details"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      return response.data; // Returns {profile: {...}, addresses: [...]}
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: token !== null,
  });
};

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: rentersApi.updateProfile,
  });

// GET /api/renters/profile/addresses - Retrieve renter addresses
export const useProfileAddresses = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renter-profile-addresses"],
    queryFn: rentersApi.getProfileAddresses,
    enabled: token !== null,
  });
};

export const useAddProfileAddress = () =>
  useMutation({
    mutationFn: rentersApi.addProfileAddress,
  });

// GET /api/renters/profile/avatar - Retrieve avatar URL
export const useProfileAvatar = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renter-profile-avatar"],
    queryFn: rentersApi.getProfileAvatar,
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: token !== null,
  });
};

export const useUploadProfileAvatar = () =>
  useMutation({
    mutationFn: rentersApi.uploadProfileAvatar,
  });
