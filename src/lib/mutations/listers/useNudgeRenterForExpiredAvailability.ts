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
    onSuccess: (_, { intent }) => {
      toast.success(
        intent === "rerequest"
          ? "The renter was emailed and notified in-app to send a new request from their cart."
          : "The renter was emailed and notified in-app that you are ready for a new request.",
      );
    },
    onError: (err: Error & { message?: string }) => {
      toast.error(err?.message || "Could not notify the renter.");
    },
  });
}
