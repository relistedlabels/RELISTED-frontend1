import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTag } from "@/lib/api/tags";

export const useCreateTag = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
