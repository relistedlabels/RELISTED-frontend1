import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNinDocument } from "@/lib/api/listers";
import { apiFetch } from "@/lib/api/http";

export const useUploadNinDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: FormData | { uploadId: string; ninNumber: string },
    ) => {
      // If it's FormData, use the original uploadNinDocument function
      if (data instanceof FormData) {
        return uploadNinDocument(data);
      }
      // If it's a plain object, send it as JSON
      return apiFetch("/api/listers/verifications/nin", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate verification status queries
      queryClient.invalidateQueries({
        queryKey: ["lister", "verification", "status"],
      });
    },
  });
};
