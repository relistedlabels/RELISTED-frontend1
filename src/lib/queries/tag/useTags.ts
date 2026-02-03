import { useQuery } from "@tanstack/react-query";
import { getTags, Tag } from "@/lib/api/tags";

export const useTags = () =>
  useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: getTags,
    retry: false,
  });
