import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNinDocument } from "@/lib/api/listers";

export function useUploadNinDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadNinDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "verifications", "status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "verifications", "documents"],
      });
    },
  });
}
