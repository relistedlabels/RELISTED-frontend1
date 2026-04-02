import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rentersApi,
  type RenterProfileBankAccountInfo,
} from "@/lib/api/renters";

export const useSubmitRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      listerId: string;
      rentalStartDate: string;
      rentalEndDate: string;
      rentalDays: number;
      estimatedRentalPrice: number;
      deliveryAddressId: string;
      autoPay: boolean;
      currency: string;
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
    mutationFn: (data: {
      fullName?: string;
      phone?: string;
      nin?: string;
      bvn?: string;
      /** @deprecated use bankAccountInfo for BankAccount sync */
      bankAccount?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
      };
      bankAccountInfo?: RenterProfileBankAccountInfo;
      bankAccounts?: RenterProfileBankAccountInfo | RenterProfileBankAccountInfo[];
    }) => rentersApi.updateProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["renters", "profile"] });
      await queryClient.invalidateQueries({
        queryKey: ["renters", "bank-accounts"],
      });
      await queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      await queryClient.refetchQueries({ queryKey: ["renters", "bank-accounts"] });
    },
  });
};
