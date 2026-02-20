import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadListerAvatar } from "@/lib/api/listers";

export function useUploadListerAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => uploadListerAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
    },
  });
}
