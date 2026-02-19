import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useSubmitRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      rentalStartDate: string;
      rentalEndDate: string;
      autoPay: boolean;
    }) => rentersApi.submitRentalRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};

export const useRemoveRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      rentersApi.removeRentalRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};

export const useConfirmRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { requestId: string; confirmPayment?: boolean }) =>
      rentersApi.confirmRentalRequest(data.requestId, {
        confirmPayment: data.confirmPayment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string }) =>
      rentersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "profile"] });
    },
  });
};
