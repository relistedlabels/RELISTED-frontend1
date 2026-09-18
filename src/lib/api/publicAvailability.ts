import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";
import { apiFetch } from "./http";

export type GuestAvailabilityPayload = {
  productId: string;
  listerId: string;
  firstName: string;
  email: string;
  rentalDays: number;
  rentalStartDate?: string | null;
  rentalEndDate?: string | null;
  estimatedRentalPrice: number;
  currency?: string;
  dispatchWindows?: DispatchWindowsPayload;
};

export async function submitGuestAvailabilityCheck(
  payload: GuestAvailabilityPayload,
) {
  return apiFetch("/api/public/availability-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPublicAvailabilityStatus(
  requestId: string,
  token: string,
) {
  const q = new URLSearchParams({ token });
  return apiFetch(
    `/api/public/availability-requests/${requestId}?${q.toString()}`,
  );
}
