import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useVerificationsStatus = () =>
  useQuery({
    queryKey: ["renter-verifications-status"],
    queryFn: rentersApi.getVerificationsStatus,
  });

export const useUploadIdDocument = () =>
  useMutation({
    mutationFn: rentersApi.uploadIdDocument,
  });
