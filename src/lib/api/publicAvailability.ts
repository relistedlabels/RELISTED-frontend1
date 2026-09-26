import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";
import { apiFetch } from "./http";

export type GuestAvailabilityPayload = {
  productId: string;
  listerId: string;
  firstName: string;
  email: string;
  whatsappPhone?: string;
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

export type PublicAvailabilitySimilarShop = {
  categoryId?: string | null;
  brandName?: string | null;
  color?: string | null;
  size?: string | null;
  primaryTag?: string | null;
};

export type PublicAvailabilityStatusResponse = {
  success: boolean;
  data: {
    requestId: string;
    status: PublicAvailabilityStatus;
    canStillBeApproved: boolean;
    businessExpiresAt: string;
    productId?: string;
    productName?: string;
    similarShop?: PublicAvailabilitySimilarShop;
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

export type AvailabilityShopFiltersResponse = {
  success: boolean;
  data: {
    productId: string;
    rentalDays: number;
    similarShop: PublicAvailabilitySimilarShop;
  };
};

export async function getAvailabilityShopFilters(requestId: string) {
  return apiFetch<AvailabilityShopFiltersResponse>(
    `/api/public/availability-requests/${requestId}/shop-filters`,
  );
}
