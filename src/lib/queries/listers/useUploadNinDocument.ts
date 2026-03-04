import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNinDocument } from "@/lib/api/listers";

export const useUploadNinDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadNinDocument(formData),
    onSuccess: () => {
      // Invalidate verification status queries
      queryClient.invalidateQueries({
        queryKey: ["lister", "verification", "status"],
      });
    },
  });
};
