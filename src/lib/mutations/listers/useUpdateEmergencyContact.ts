import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEmergencyContact,
  EmergencyContactPayload,
} from "@/lib/api/listers";

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmergencyContactPayload) => updateEmergencyContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
