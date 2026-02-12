import { useQuery } from "@tanstack/react-query";
import { getBusinessProfile } from "@/lib/api/listers";

export function useBusinessProfile() {
  return useQuery({
    queryKey: ["listers", "businessProfile"],
    queryFn: () => getBusinessProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
