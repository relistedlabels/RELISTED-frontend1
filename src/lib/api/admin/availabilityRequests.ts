import { apiFetch } from "../http";

export type AvailabilityRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "ORDERED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED_BY_RENTER";

export type AvailabilityRequestType = "purchase" | "rental";

export interface AvailabilityRequestPerson {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  avatar: string | null;
}

export interface AvailabilityRequestWindow {
  start: string;
  end: string;
}

export interface AvailabilityRequest {
  id: string;
  status: AvailabilityRequestStatus;
  requestType: AvailabilityRequestType;
  rentalDays: number;
  totalPrice: number;
  startDate: string | null;
  endDate: string | null;
  expiresAt: string;
  createdAt: string;
  autoPay: boolean;
  rejectionReason: string | null;
  cartItemId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    listingType: string;
    brand: string | null;
    image: string | null;
    dailyPrice?: number | null;
    resalePrice?: number | null;
  } | null;
  requester: AvailabilityRequestPerson | null;
  lister: AvailabilityRequestPerson | null;
  windows: {
    outbound: AvailabilityRequestWindow | null;
    return: AvailabilityRequestWindow | null;
    resale: AvailabilityRequestWindow | null;
  };
  canNudgeRenter: boolean;
  canResendToLister: boolean;
}

export interface AvailabilityRequestStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  rejected: number;
  cancelled: number;
  purchase: number;
  rental: number;
  needingAttention: number;
}

export interface AvailabilityRequestListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

function buildParams(params: AvailabilityRequestListParams): string {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set("page", String(params.page));
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.status && params.status !== "All") sp.set("status", params.status);
  if (params.type && params.type !== "all") sp.set("type", params.type);
  if (params.search) sp.set("search", params.search);
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  return sp.toString();
}

export const availabilityRequestsApi = {
  getStats: () =>
    apiFetch<{ success: true; data: AvailabilityRequestStats }>(
      `/api/admin/availability-requests/stats`,
    ),

  getRequests: (params: AvailabilityRequestListParams = {}) =>
    apiFetch<{
      success: true;
      data: {
        requests: AvailabilityRequest[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/api/admin/availability-requests?${buildParams(params)}`),

  getById: (requestId: string) =>
    apiFetch<{ success: true; data: AvailabilityRequest }>(
      `/api/admin/availability-requests/${requestId}`,
    ),

  nudgeRenter: (
    requestId: string,
    intent: "rerequest" | "now_available" = "now_available",
  ) =>
    apiFetch<{
      success: true;
      message: string;
      data: { requestId: string; intent: string };
    }>(`/api/admin/availability-requests/${requestId}/nudge-renter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent }),
    }),

  resendToLister: (requestId: string) =>
    apiFetch<{
      success: true;
      message: string;
      data: {
        requestId: string;
        reactivated: boolean;
        status: string;
        expiresAt: string;
      };
    }>(`/api/admin/availability-requests/${requestId}/resend-to-lister`, {
      method: "POST",
    }),
};
