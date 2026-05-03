import { apiFetch } from "./http";

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
  product?: { name: string | null } | null;
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
  dispatchAttempts: number;
  dispatchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: ShipmentOrderSummary;
  attemptLogs?: DispatchAttemptLog[];
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
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<ShipmentsListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.orderId) queryParams.append("orderId", params.orderId);
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
