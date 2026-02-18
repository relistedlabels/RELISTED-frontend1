import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

interface RentalRequestPayload {
  productId: string;
  listerId: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  estimatedRentalPrice: number;
  deliveryAddressId?: string;
  autoPay?: boolean;
  currency?: string;
}

interface RentalRequestResponse {
  success: boolean;
  data: {
    requestId: string;
    cartItemId: string;
    expiresAt: string;
    timeRemainingSeconds: number;
  };
}

export function useSubmitAvailabilityCheck() {
  return useMutation({
    mutationFn: async (payload: RentalRequestPayload) => {
      try {
        const response = await apiFetch<RentalRequestResponse>(
          "/api/renters/rental-requests",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        if (!response.success) {
          throw new Error("Failed to submit availability request");
        }

        return response.data;
      } catch (error) {
        console.error("Error submitting availability request:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Availability check mutation error:", error);
    },
  });
}
