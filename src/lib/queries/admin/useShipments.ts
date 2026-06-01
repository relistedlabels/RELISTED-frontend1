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
