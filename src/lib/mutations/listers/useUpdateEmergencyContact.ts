import { useMutation } from "@tanstack/react-query";
import {
  updateEmergencyContact,
  EmergencyContactPayload,
} from "@/lib/api/listers";

export function useUpdateEmergencyContact() {
  return useMutation({
    mutationFn: (data: EmergencyContactPayload) => updateEmergencyContact(data),
  });
}
