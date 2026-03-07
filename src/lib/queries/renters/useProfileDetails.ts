import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

// GET /api/renters/profile - Retrieve renter profile information
export const useProfileDetails = () =>
  useQuery({
    queryKey: ["renter-profile-details"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      // Extract profile from nested response structure
      console.log("✅ Full response:", response);
      console.log("✅ Profile from data.profile:", response.data?.profile);
      return response.data; // Returns {profile: {...}, addresses: [...]}
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: rentersApi.updateProfile,
  });

// GET /api/renters/profile/addresses - Retrieve renter addresses
export const useProfileAddresses = () =>
  useQuery({
    queryKey: ["renter-profile-addresses"],
    queryFn: rentersApi.getProfileAddresses,
  });

export const useAddProfileAddress = () =>
  useMutation({
    mutationFn: rentersApi.addProfileAddress,
  });

// GET /api/renters/profile/avatar - Retrieve avatar URL
export const useProfileAvatar = () =>
  useQuery({
    queryKey: ["renter-profile-avatar"],
    queryFn: rentersApi.getProfileAvatar,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

export const useUploadProfileAvatar = () =>
  useMutation({
    mutationFn: rentersApi.uploadProfileAvatar,
  });
