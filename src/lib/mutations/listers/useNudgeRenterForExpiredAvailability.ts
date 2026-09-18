import { useMutation } from "@tanstack/react-query";
import { nudgeRenterForExpiredAvailability } from "@/lib/api/listers";
import { toast } from "sonner";

export function useNudgeRenterForExpiredAvailability() {
  return useMutation({
    mutationFn: ({
      orderId,
      intent = "now_available",
    }: {
      orderId: string;
      intent?: "rerequest" | "now_available";
    }) => nudgeRenterForExpiredAvailability(orderId, intent),
    onSuccess: () => {
      toast.success(
        "Renter notified with a link to check availability again.",
      );
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err?.message || "Could not notify the renter.");
    },
  });
}
