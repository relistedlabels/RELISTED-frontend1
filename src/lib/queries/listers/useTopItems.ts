import { useQuery } from "@tanstack/react-query";
import { getTopItems } from "@/lib/api/listers";

export function useTopItems(limit: number = 5) {
  return useQuery({
    queryKey: ["listers", "inventory", "top-items", limit],
    queryFn: () => getTopItems(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
