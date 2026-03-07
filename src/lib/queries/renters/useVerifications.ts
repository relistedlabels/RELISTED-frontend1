import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useVerificationsStatus = () =>
  useQuery({
    queryKey: ["renter-verifications-status"],
    queryFn: rentersApi.getVerificationsStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

export const useUploadIdDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rentersApi.uploadIdDocument,
    onSuccess: () => {
      console.log("✅ NIN document uploaded");
      queryClient.invalidateQueries({
        queryKey: ["renter-verifications-status"],
      });
    },
    onError: (error: any) => {
      console.error("❌ Failed to upload NIN document:", error);
    },
  });
};
export const useSubmitBvn = () =>
  useMutation({
    mutationFn: rentersApi.submitBvn,
  });

// ✅ Mutation for updating BVN, NIN, and emergency contacts via PUT /api/renters/profile
export const useUpdateVerificationDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rentersApi.updateProfile,
    onSuccess: () => {
      console.log("✅ Verification details updated");
      // Invalidate both profile and verification queries
      queryClient.invalidateQueries({ queryKey: ["renters", "profile"] });
      queryClient.invalidateQueries({
        queryKey: ["renter-verifications-status"],
      });
    },
    onError: (error: any) => {
      console.error("❌ Failed to update verification details:", error);
    },
  });
};
