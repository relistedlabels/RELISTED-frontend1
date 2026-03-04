import { useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export function useUploadIdDocument() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await rentersApi.uploadIdDocument(formData);
      return response;
    },
  });
}
