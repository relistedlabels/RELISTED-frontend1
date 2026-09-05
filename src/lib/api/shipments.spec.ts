import { beforeEach, describe, expect, mock, test } from "bun:test";

const apiFetchMock = mock(() =>
  Promise.resolve({ success: true, message: "ok", data: {} }),
);

mock.module("./http", () => ({
  apiFetch: apiFetchMock,
}));

const {
  getShipmentRatePreview,
  dispatchShipmentNow,
  reconcileManualShipment,
} = await import("./shipments");

describe("getShipmentRatePreview", () => {
  beforeEach(() => {
    apiFetchMock.mockClear();
  });

  test("GETs rate-preview without query when forImmediate is false", async () => {
    await getShipmentRatePreview("ship-1", false);

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(apiFetchMock).toHaveBeenCalledWith("/shipments/ship-1/rate-preview", {
      method: "GET",
    });
  });

  test("GETs rate-preview with forImmediate=true when requested", async () => {
    await getShipmentRatePreview("ship-2", true);

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/shipments/ship-2/rate-preview?forImmediate=true",
      { method: "GET" },
    );
  });

  test("defaults forImmediate to false when omitted", async () => {
    await getShipmentRatePreview("ship-3");

    const [path] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/shipments/ship-3/rate-preview");
    expect(path).not.toContain("forImmediate");
  });
});

describe("dispatchShipmentNow", () => {
  beforeEach(() => {
    apiFetchMock.mockClear();
  });

  test("POSTs dispatch-now with pricing tier and updateWindow", async () => {
    await dispatchShipmentNow("ship-1", {
      pricingTier: "chowdeck",
      updateWindow: true,
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/shipments/ship-1/dispatch-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricingTier: "chowdeck",
        updateWindow: true,
      }),
    });
  });

  test("POSTs dispatch-now with empty body when options omitted", async () => {
    await dispatchShipmentNow("ship-2");

    expect(apiFetchMock).toHaveBeenCalledWith("/shipments/ship-2/dispatch-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricingTier: undefined,
        updateWindow: undefined,
      }),
    });
  });

  test("POSTs updateWindow=false to preserve scheduled window", async () => {
    await dispatchShipmentNow("ship-3", { updateWindow: false });

    const [, options] = apiFetchMock.mock.calls[0] ?? [];
    expect(JSON.parse(String(options?.body))).toEqual({
      pricingTier: undefined,
      updateWindow: false,
    });
  });
});

describe("reconcileManualShipment", () => {
  beforeEach(() => {
    apiFetchMock.mockClear();
  });

  test("POSTs reconcile-manual with all optional reconciliation fields", async () => {
    await reconcileManualShipment("ship-1", {
      trackingId: "RIDER-42",
      trackingUrl: "https://track.example/r42",
      actualFulfillmentCostKobo: 420000,
      adminReconcileNote: "In-house rider",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/shipments/ship-1/reconcile-manual",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: "RIDER-42",
          trackingUrl: "https://track.example/r42",
          actualFulfillmentCostKobo: 420000,
          adminReconcileNote: "In-house rider",
        }),
      },
    );
  });

  test("POSTs reconcile-manual with undefined body fields when omitted", async () => {
    await reconcileManualShipment("ship-2");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/shipments/ship-2/reconcile-manual",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: undefined,
          trackingUrl: undefined,
          actualFulfillmentCostKobo: undefined,
          adminReconcileNote: undefined,
        }),
      },
    );
  });
});
