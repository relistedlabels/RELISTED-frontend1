import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateListerAddress, type AddAddressPayload } from "@/lib/api/listers";

export function useUpdateListerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: Partial<AddAddressPayload>;
    }) => updateListerAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "profile", "addresses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "profile"],
      });
    },
  });
}
