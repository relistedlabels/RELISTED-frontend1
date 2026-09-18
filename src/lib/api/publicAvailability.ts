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

export type GuestAvailabilitySubmitResponse = {
  success?: boolean;
  message?: string;
  data?: {
    requestId?: string;
    accessToken?: string | null;
    checkingUrl?: string | null;
    businessExpiresAt?: string;
  };
};

export async function submitGuestAvailabilityCheck(
  payload: GuestAvailabilityPayload,
) {
  return apiFetch<GuestAvailabilitySubmitResponse>(
    "/api/public/availability-requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type PublicAvailabilityStatus =
  | "available"
  | "unavailable"
  | "cancelled"
  | "dates_passed"
  | "awaiting_lister"
  | "checking"
  | string;

export type PublicAvailabilityStatusResponse = {
  success: boolean;
  data: {
    requestId: string;
    status: PublicAvailabilityStatus;
    canStillBeApproved: boolean;
    businessExpiresAt: string;
    productName?: string;
    rentalDays: number;
    rentalStartDate?: string | null;
    rentalEndDate?: string | null;
    totalPrice?: number;
    requesterEmail?: string | null;
    completeRentalUrl?: string | null;
  };
};

export async function getPublicAvailabilityStatus(
  requestId: string,
  token: string,
) {
  const q = new URLSearchParams({ token });
  return apiFetch<PublicAvailabilityStatusResponse>(
    `/api/public/availability-requests/${requestId}?${q.toString()}`,
  );
}
