import { apiFetch } from "./http";
import type { AdminReturnRequest } from "./admin/orders";

/** Mirrors Prisma `ShipmentStatus` from relisted-backend */
export type ShipmentStatus =
  | "PENDING"
  | "DISPATCHING"
  | "DISPATCH_FAILED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

/** Mirrors Prisma `ShipmentType` */
export type ShipmentType = "OUTBOUND" | "RETURN" | "RESALE";

/** List view (`GET /shipments`) — partial `order`. Detail (`GET /shipments/:id`) adds `id`, `orderItems`. */
export interface ShipmentOrderLineItem {
  id?: string;
  days?: number | null;
  product?: {
    name: string | null;
    color?: string | null;
    condition?: string | null;
    measurement?: string | null;
    material?: string | null;
    composition?: string | null;
    listingType?: string | null;
    brand?: { name: string | null } | null;
    category?: { name: string | null } | null;
    attachments?: {
      uploads?: Array<{
        id?: string;
        url?: string | null;
        displayOrder?: number | null;
      }>;
    } | null;
  } | null;
}

export interface ShipmentOrderSummary {
  id?: string;
  orderId: string;
  userId: string;
  user?: { name: string | null; email: string | null };
  orderListers?: unknown;
  orderItems?: ShipmentOrderLineItem[];
}

export interface DispatchAttemptLog {
  id: string;
  shipmentId: string;
  attemptNumber: number;
  attemptedAt: string;
  success: boolean;
  errorCode?: string | null;
  errorMessage?: string | null;
  durationMs?: number | null;
}

export type AddressSnapshot = Record<string, unknown>;

export interface Shipment {
  id: string;
  orderId: string;
  listerId?: string | null;
  type: ShipmentType;
  status: ShipmentStatus;
  scheduledDate: string;
  scheduledWindowStart?: string | null;
  scheduledWindowEnd?: string | null;
  pickupAddress: AddressSnapshot;
  deliveryAddress: AddressSnapshot;
  providerShipmentId?: string | null;
  providerTrackingUrl?: string | null;
  trackingId?: string | null;
  pricingTier?: string | null;
  shipmentCharge?: number | null;
  pickupCharge?: number | null;
  vatCharge?: number | null;
  pickupPartner?: string | null;
  pickupId?: string | null;
  deliveryLocation?: string | null;
  manualFulfillment?: boolean;
  reconciledAsManualAt?: string | null;
  actualFulfillmentCostKobo?: number | null;
  adminReconcileNote?: string | null;
  dispatchAttempts: number;
  dispatchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: ShipmentOrderSummary;
  attemptLogs?: DispatchAttemptLog[];
  returnRequest?: AdminReturnRequest | null;
}

export interface ShipmentsListData {
  shipments: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShipmentsListResponse {
  success: boolean;
  data: ShipmentsListData;
}

export interface ShipmentCostsData {
  totalKobo: number;
  count: number;
  trend: { month: string; kobo: number; count: number }[];
  groups: { key: string; label: string; kobo: number; count: number }[];
  providers: string[];
  couriers: string[];
}

export interface ShipmentDetailResponse {
  success: boolean;
  data: Shipment;
}

export interface OrderShipmentsResponse {
  success: boolean;
  data: Shipment[];
}

/** Admin tracking summary from `GET /shipments/:id/tracking` */
export interface ShipmentTrackingResponse {
  success: boolean;
  data: {
    shipmentId: string;
    status: ShipmentStatus;
    providerShipmentId?: string | null;
    providerTrackingUrl?: string | null;
    trackingId?: string | null;
    dispatchedAt?: string | null;
    scheduledDate: string;
    type: ShipmentType;
  };
}

export const getShipments = async (params?: {
  status?: ShipmentStatus;
  type?: ShipmentType;
  orderId?: string;
  manualFulfillment?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<ShipmentsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.orderId) queryParams.append("orderId", params.orderId);
  if (params?.manualFulfillment === true) {
    queryParams.append("manualFulfillment", "true");
  }
  if (params?.manualFulfillment === false) {
    queryParams.append("manualFulfillment", "false");
  }
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const qs = queryParams.toString();
  return apiFetch<ShipmentsListResponse>(
    `/shipments${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
};

export const getShipmentCosts = async (params?: {
  status?: ShipmentStatus;
  type?: ShipmentType;
  orderId?: string;
  manualFulfillment?: boolean;
  dateFrom?: string;
  dateTo?: string;
  provider?: string;
  courier?: string;
}) =>
  apiFetch<{ success: boolean; data: ShipmentCostsData }>(
    `/shipments/costs?${new URLSearchParams(
      Object.entries({
        ...(params?.status && { status: params.status }),
        ...(params?.type && { type: params.type }),
        ...(params?.orderId && { orderId: params.orderId }),
        ...(params?.manualFulfillment === true && { manualFulfillment: "true" }),
        ...(params?.manualFulfillment === false && { manualFulfillment: "false" }),
        ...(params?.dateFrom && { dateFrom: params.dateFrom }),
        ...(params?.dateTo && { dateTo: params.dateTo }),
        ...(params?.provider && params.provider !== "all" && { provider: params.provider }),
        ...(params?.courier && params.courier !== "all" && { courier: params.courier }),
      }).map(([k, v]) => [k, String(v)]),
    ).toString()}`,
    { method: "GET" },
  );

export const getShipment = async (
  shipmentId: string,
): Promise<ShipmentDetailResponse> => {
  return apiFetch<ShipmentDetailResponse>(`/shipments/${shipmentId}`, {
    method: "GET",
  });
};

export const getShipmentTracking = async (
  shipmentId: string,
): Promise<ShipmentTrackingResponse> => {
  return apiFetch<ShipmentTrackingResponse>(
    `/shipments/${shipmentId}/tracking`,
    { method: "GET" },
  );
};

export const getOrderShipments = async (
  orderId: string,
): Promise<OrderShipmentsResponse> => {
  return apiFetch<OrderShipmentsResponse>(`/orders/${orderId}/shipments`, {
    method: "GET",
  });
};

export const cancelShipment = async (
  shipmentId: string,
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/cancel`,
    { method: "POST" },
  );
};

export const redispatchShipment = async (
  shipmentId: string,
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/redispatch`,
    { method: "POST" },
  );
};

export const completeManualShipment = async (
  shipmentId: string,
  body?: { trackingId?: string; trackingUrl?: string },
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/manual-complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: body?.trackingId,
        trackingUrl: body?.trackingUrl,
      }),
    },
  );
};

/** POST /shipments/:id/manual-delivered — admin marks a dispatched leg completed. */
export const markManualShipmentDelivered = async (
  shipmentId: string,
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/manual-delivered`,
    { method: "POST" },
  );
};

export interface ShipmentRateTier {
  pricingTier: string;
  name: string;
  shipmentChargeKobo: number;
  pickupChargeKobo: number;
  vatChargeKobo: number;
  totalCostKobo: number;
  deltaKobo: number;
  description?: string;
}

export interface ShipmentRatePreviewData {
  tiers: ShipmentRateTier[];
  warnings: Array<{
    provider: string;
    message: string;
    leg: "outbound" | "return";
  }>;
  renterChargedKobo: number;
  quoteWindowStart: string;
  storedWindowStart: string | null;
  forImmediate: boolean;
}

export const getShipmentRatePreview = async (
  shipmentId: string,
  forImmediate = false,
): Promise<{ success: boolean; data: ShipmentRatePreviewData }> => {
  const qs = forImmediate ? "?forImmediate=true" : "";
  return apiFetch<{ success: boolean; data: ShipmentRatePreviewData }>(
    `/shipments/${shipmentId}/rate-preview${qs}`,
    { method: "GET" },
  );
};

export const dispatchShipmentNow = async (
  shipmentId: string,
  body?: { pricingTier?: string; updateWindow?: boolean },
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/dispatch-now`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricingTier: body?.pricingTier,
        updateWindow: body?.updateWindow,
      }),
    },
  );
};

export const reconcileManualShipment = async (
  shipmentId: string,
  body?: {
    trackingId?: string;
    trackingUrl?: string;
    actualFulfillmentCostKobo?: number;
    adminReconcileNote?: string;
  },
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/reconcile-manual`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: body?.trackingId,
        trackingUrl: body?.trackingUrl,
        actualFulfillmentCostKobo: body?.actualFulfillmentCostKobo,
        adminReconcileNote: body?.adminReconcileNote,
      }),
    },
  );
};

export const switchShipmentToManual = async (
  shipmentId: string,
  body?: { adminReconcileNote?: string },
): Promise<{ success: boolean; message: string }> => {
  return apiFetch<{ success: boolean; message: string }>(
    `/shipments/${shipmentId}/switch-to-manual`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminReconcileNote: body?.adminReconcileNote,
      }),
    },
  );
};
