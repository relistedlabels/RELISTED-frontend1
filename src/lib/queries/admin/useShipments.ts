import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipments,
  getShipmentCosts,
  getShipment,
  getShipmentTracking,
  getOrderShipments,
  cancelShipment,
  redispatchShipment,
  completeManualShipment,
  markManualShipmentDelivered,
  getShipmentRatePreview,
  dispatchShipmentNow,
  reconcileManualShipment,
  switchShipmentToManual,
  type ShipmentStatus,
  type ShipmentType,
} from "@/lib/api/shipments";

export const useShipments = (params?: {
  status?: ShipmentStatus;
  type?: ShipmentType;
  orderId?: string;
  manualFulfillment?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["admin", "shipments", params],
    queryFn: () => getShipments(params),
  });
};

export const useShipmentCosts = (params?: {
  status?: ShipmentStatus;
  type?: ShipmentType;
  orderId?: string;
  manualFulfillment?: boolean;
  dateFrom?: string;
  dateTo?: string;
  provider?: string;
  courier?: string;
}) =>
  useQuery({
    queryKey: ["admin", "shipments", "costs", params],
    queryFn: () => getShipmentCosts(params),
  });

export const useShipment = (
  shipmentId: string,
  options?: { enabled?: boolean },
) => {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ["admin", "shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
    enabled: enabled && !!shipmentId,
  });
};

export const useShipmentTracking = (shipmentId: string) => {
  return useQuery({
    queryKey: ["admin", "shipment", shipmentId, "tracking"],
    queryFn: () => getShipmentTracking(shipmentId),
    enabled: !!shipmentId,
  });
};

export const useOrderShipments = (orderId: string) => {
  return useQuery({
    queryKey: ["admin", "order", orderId, "shipments"],
    queryFn: () => getOrderShipments(orderId),
    enabled: !!orderId,
  });
};

export const useCancelShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => cancelShipment(shipmentId),
    onSuccess: (_data, shipmentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};

export const useRedispatchShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => redispatchShipment(shipmentId),
    onSuccess: (_data, shipmentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};

export const useCompleteManualShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      trackingId,
      trackingUrl,
    }: {
      shipmentId: string;
      trackingId?: string;
      trackingUrl?: string;
    }) => completeManualShipment(shipmentId, { trackingId, trackingUrl }),
    onSuccess: (_data, { shipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};

export const useMarkManualShipmentDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => markManualShipmentDelivered(shipmentId),
    onSuccess: (_data, shipmentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};

export const useShipmentRatePreview = (
  shipmentId: string,
  forImmediate: boolean,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["admin", "shipment", shipmentId, "rate-preview", forImmediate],
    queryFn: () => getShipmentRatePreview(shipmentId, forImmediate),
    enabled: enabled && !!shipmentId,
  });
};

export const useDispatchShipmentNow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      pricingTier,
      updateWindow,
    }: {
      shipmentId: string;
      pricingTier?: string;
      updateWindow?: boolean;
    }) => dispatchShipmentNow(shipmentId, { pricingTier, updateWindow }),
    onSuccess: (_data, { shipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "shipment", shipmentId, "rate-preview"],
      });
    },
  });
};

export const useReconcileManualShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      trackingId,
      trackingUrl,
      actualFulfillmentCostKobo,
      adminReconcileNote,
    }: {
      shipmentId: string;
      trackingId?: string;
      trackingUrl?: string;
      actualFulfillmentCostKobo?: number;
      adminReconcileNote?: string;
    }) =>
      reconcileManualShipment(shipmentId, {
        trackingId,
        trackingUrl,
        actualFulfillmentCostKobo,
        adminReconcileNote,
      }),
    onSuccess: (_data, { shipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};

export const useSwitchShipmentToManual = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      adminReconcileNote,
    }: {
      shipmentId: string;
      adminReconcileNote?: string;
    }) =>
      switchShipmentToManual(shipmentId, {
        adminReconcileNote,
      }),
    onSuccess: (_data, { shipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "shipment", shipmentId] });
    },
  });
};
