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
        "Renter notified by email and in-app that the item is available.",
      );
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err?.message || "Could not notify the renter.");
    },
  });
}
