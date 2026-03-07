import { useMutation } from "@tanstack/react-query";
import {
  updateRenterProfilePhone,
  submitRenterAddress,
} from "@/lib/api/profile";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvalidateProfile } from "@/lib/queries/user/useProfile";

interface RenterProfileSubmissionData {
  phoneNumber: string;
  bvn?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
}

export function useSubmitRenterAddress() {
  const resetProfile = useProfileStore((s) => s.resetProfile);
  const invalidateProfile = useInvalidateProfile();

  return useMutation({
    mutationFn: async (data: RenterProfileSubmissionData) => {
      // Step 1: Update profile with phone number
      await updateRenterProfilePhone(data.phoneNumber, data.bvn);

      // Step 2: Submit address
      return await submitRenterAddress(data.address);
    },
    onSuccess: () => {
      // Clear local profile store - we'll fetch from server when needed
      resetProfile();

      // Invalidate the profile cache to refetch fresh data
      invalidateProfile();

      console.log(
        "Renter profile and address submitted successfully, store cleared",
      );
    },
  });
}
