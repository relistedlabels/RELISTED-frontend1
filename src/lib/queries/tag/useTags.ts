// lib/queries/tag/useTags.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTags, createTag, Tag } from "@/lib/api/tags";

export const useTags = () =>
  useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: getTags,
    retry: false,
  });

export const useCreateTag = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
