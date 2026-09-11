import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
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
  getShipmentRatePreviewSources,
  dispatchShipmentNow,
  reconcileManualShipment,
  switchShipmentToManual,
  type ShipmentRatePreviewData,
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

/** Fetches each carrier source separately so fast providers are not blocked by slow ones. */
export const useAdminShipmentRatePreview = (
  shipmentId: string,
  forImmediate: boolean,
  enabled: boolean,
) => {
  const sourcesQuery = useQuery({
    queryKey: ["admin", "rate-preview-sources"],
    queryFn: () => getShipmentRatePreviewSources(),
    staleTime: 60_000,
    enabled,
  });

  const providers = sourcesQuery.data?.data?.providers ?? [];

  const providerQueries = useQueries({
    queries: providers.map((provider) => ({
      queryKey: [
        "admin",
        "shipment",
        shipmentId,
        "rate-preview",
        provider,
        forImmediate,
      ] as const,
      queryFn: () => getShipmentRatePreview(shipmentId, forImmediate, provider),
      enabled: enabled && !!shipmentId && providers.length > 0,
    })),
  });

  const merged = useMemo(() => {
    const tiers: ShipmentRatePreviewData["tiers"] = [];
    const warnings: ShipmentRatePreviewData["warnings"] = [];
    let meta: ShipmentRatePreviewData | undefined;

    for (const q of providerQueries) {
      const slice = q.data?.data;
      if (!slice?.available) continue;
      if (slice.tiers?.length) tiers.push(...slice.tiers);
      if (slice.warnings?.length) warnings.push(...slice.warnings);
      if (!meta) {
        meta = {
          tiers: [],
          warnings: [],
          renterChargedKobo: slice.renterChargedKobo,
          quoteWindowStart: slice.quoteWindowStart,
          storedWindowStart: slice.storedWindowStart,
          forImmediate: slice.forImmediate,
        };
      }
    }

    if (!meta) return undefined;
    return { ...meta, tiers, warnings };
  }, [providerQueries.map((q) => q.dataUpdatedAt).join("|")]);

  const providerStatus = providers.map((provider, index) => {
    const q = providerQueries[index];
    return {
      provider,
      loading: Boolean(q?.isLoading || q?.isFetching),
      error: Boolean(q?.isError),
    };
  });

  const refetchAll = async () => {
    await sourcesQuery.refetch();
    await Promise.all(providerQueries.map((q) => q.refetch()));
  };

  const anyProviderLoading = providerStatus.some((p) => p.loading);
  const sourcesLoading = sourcesQuery.isLoading || sourcesQuery.isFetching;

  return {
    data: merged ? { success: true as const, data: merged } : undefined,
    providerStatus,
    sourcesLoading,
    anyProviderLoading,
    isError: sourcesQuery.isError || providerQueries.some((q) => q.isError),
    refetch: refetchAll,
  };
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
