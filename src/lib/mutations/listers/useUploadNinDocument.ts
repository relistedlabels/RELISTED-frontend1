import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadIdDocument } from "@/lib/api/listers";

export function useUploadNinDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { uploadId: string; idType: string }) =>
      uploadIdDocument(data),
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
