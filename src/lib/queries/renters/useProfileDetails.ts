import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useProfileDetails = () =>
  useQuery({
    queryKey: ["renter-profile-details"],
    queryFn: rentersApi.getProfile,
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: rentersApi.updateProfile,
  });

export const useProfileAddresses = () =>
  useQuery({
    queryKey: ["renter-profile-addresses"],
    queryFn: rentersApi.getProfileAddresses,
  });

export const useAddProfileAddress = () =>
  useMutation({
    mutationFn: rentersApi.addProfileAddress,
  });

export const useUploadProfileAvatar = () =>
  useMutation({
    mutationFn: rentersApi.uploadProfileAvatar,
  });
