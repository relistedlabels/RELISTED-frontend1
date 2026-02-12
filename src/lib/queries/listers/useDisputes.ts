import { useQuery } from "@tanstack/react-query";
import { getDisputes } from "@/lib/api/listers";

export function useDisputes(
  page: number = 1,
  limit: number = 10,
  status: string = "all",
  search?: string,
  sortBy: string = "-dateSubmitted",
) {
  return useQuery({
    queryKey: ["listers", "disputes", page, limit, status, search, sortBy],
    queryFn: () => getDisputes(page, limit, status, search, sortBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
