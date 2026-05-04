"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutContactAndPayment from "./components/CheckoutContactAndPayment";
import FinalOrderSummaryCard from "./components/FinalOrderSummaryCard";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { productApi } from "@/lib/api/product";
import {
  getOrderSummaryApi,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";
import { approvedRentalsMatchingCurrentCart } from "@/lib/cart/approvedRentalsMatchingCart";
import type {
  DerivedDispatchWindow,
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
} from "@/lib/checkout/dispatchWindows";
import {
  deriveDefaultDispatchWindow,
  formatLagosDate,
  formatWindowRange,
  getLagosDateString,
  addDaysToDateString,
  type ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";
import { useDispatchScheduleClock } from "@/lib/checkout/useDispatchScheduleClock";

type ResaleWindow = { start: string; end: string };

/** Resale slot may be on the request row or only on the cart line snapshot (`rentalRequest`). */
function pickResaleWindowFromCheckoutItem(item: unknown): ResaleWindow | undefined {
  if (!item || typeof item !== "object") return undefined;
  const o = item as Record<string, unknown>;
  const top = o.selectedWindows as { resaleWindow?: ResaleWindow | null } | undefined;
  if (top?.resaleWindow?.start && top?.resaleWindow?.end) {
    return { start: top.resaleWindow.start, end: top.resaleWindow.end };
  }
  const rr = o.rentalRequest as
    | { selectedWindows?: { resaleWindow?: ResaleWindow | null } }
    | undefined;
  const w1 = rr?.selectedWindows?.resaleWindow;
  if (w1?.start && w1?.end) return { start: w1.start, end: w1.end };
  const rrs = o.rentalRequests as
    | { selectedWindows?: { resaleWindow?: ResaleWindow | null } }[]
    | undefined;
  const w2 = rrs?.[0]?.selectedWindows?.resaleWindow;
  if (w2?.start && w2?.end) return { start: w2.start, end: w2.end };
  return undefined;
}

export default function CheckoutPage() {
  const [shippingTiers, setShippingTiers] = useState<
    Array<{
      name: string;
      totalShippingCost: number;
      grandTotal: number;
    }>
  >([]);
  const [selectedShippingTier, setSelectedShippingTier] = useState<string>("");

  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: "/shop/cart" },
    { label: "Checkout", href: null },
  ];

  const dispatchScheduleClock = useDispatchScheduleClock();
  const { data, isLoading, error } = useRentalRequests("approved", 1, 100);
  const { data: cartData, isLoading: cartIsLoading } = useCartItems();
  const [cartItemsWithProduct, setCartItemsWithProduct] = useState<Array<any>>(
    [],
  );

  const handleReturnPickupAddressChange = useCallback(
    (value?: ReturnPickupAddressPayload) => {
      setReturnPickupAddress(value);
    },
    [],
  );
  const [resaleItemsWithProduct, setResaleItemsWithProduct] = useState<
    Array<any>
  >([]);
  const [dispatchSelections, setDispatchSelections] =
    useState<DispatchWindowSelectionMap>({});
  const [returnPickupAddress, setReturnPickupAddress] = useState<
    ReturnPickupAddressPayload | undefined
  >(undefined);

  // Fetch shipping tiers on mount
  useEffect(() => {
    const fetchShippingTiers = async () => {
      try {
        const response = await getOrderSummaryApi();
        if (response.data?.shippingTiers) {
          setShippingTiers(response.data.shippingTiers);
        }
      } catch (err) {
        console.error("Failed to fetch shipping tiers:", err);
      }
    };
    fetchShippingTiers();
  }, []);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!data?.rentalRequests) return;
      const requests = data.rentalRequests;
      const results = await Promise.all(
        requests.map(async (item) => {
          try {
            const response = await productApi.getPublicById(item.productId);
            return {
              ...item,
              productDetail: response.data,
            };
          } catch (err) {
            return {
              ...item,
              productDetail: null,
              productDetailError: err,
            };
          }
        }),
      );
      setCartItemsWithProduct(results);
    }
    fetchProductDetails();
  }, [data]);

  useEffect(() => {
    async function fetchResaleProductDetails() {
      if (!cartData?.items) return;

      const resaleItems = cartData.items.filter((item: any) => item.days === 0);
      if (resaleItems.length === 0) {
        setResaleItemsWithProduct([]);
        return;
      }

      const results = await Promise.all(
        resaleItems.map(async (item: any) => {
          let pDetail: any = null;
          try {
            const response = await productApi.getPublicById(item.productId);
            pDetail = response.data;
          } catch (err) {
            // keep null
          }
          return {
            ...item,
            cartItemId: item.id,
            productDetail: pDetail,
            isResale: true,
            rentalPrice: pDetail?.resalePrice || 0,
            securityDeposit: 0,
            cleaningFee: 0,
            deliveryFee: 0, // Should be addressed in order breakdown
            rentalDays: 0,
            listerId: pDetail?.curatorId,
          };
        }),
      );
      setResaleItemsWithProduct(results);
    }
    fetchResaleProductDetails();
  }, [cartData]);

  const approvedOnCheckout = useMemo(() => {
    const fromRentals = approvedRentalsMatchingCurrentCart(
      cartItemsWithProduct,
      cartData?.items,
    );
    // Filter out resale items that already exist in rental requests to prevent duplicates
    const rentalProductIds = new Set(fromRentals.map((item) => item.productId));
    const uniqueResaleItems = resaleItemsWithProduct.filter(
      (item) => !rentalProductIds.has(item.productId),
    );
    return [...fromRentals, ...uniqueResaleItems];
  }, [cartItemsWithProduct, cartData?.items, resaleItemsWithProduct]);

  const rentalItems = useMemo(
    () =>
      approvedOnCheckout.filter(
        (item) => !(item.isResale || item.rentalDays === 0),
      ),
    [approvedOnCheckout],
  );

  const resaleItems = useMemo(
    () =>
      approvedOnCheckout.filter(
        (item) => item.isResale || item.rentalDays === 0,
      ),
    [approvedOnCheckout],
  );

  const outboundBaseDate = useMemo(() => {
    if (rentalItems.length === 0) return undefined;
    return rentalItems.reduce((earliest: string | undefined, item) => {
      if (!item.rentalStartDate) return earliest;
      if (!earliest) return item.rentalStartDate;
      return new Date(item.rentalStartDate) < new Date(earliest)
        ? item.rentalStartDate
        : earliest;
    }, undefined);
  }, [rentalItems]);

  const returnBaseDate = useMemo(() => {
    if (rentalItems.length === 0) return undefined;
    const latestEndDate = rentalItems.reduce(
      (latest: string | undefined, item) => {
        if (!item.rentalEndDate) return latest;
        if (!latest) return item.rentalEndDate;
        return new Date(item.rentalEndDate) > new Date(latest)
          ? item.rentalEndDate
          : latest;
      },
      undefined,
    );
    // Return date is typically one day after the rental end date
    return latestEndDate ? addDaysToDateString(latestEndDate, 1) : undefined;
  }, [rentalItems]);

  const dispatchContexts = useMemo(() => {
    const contexts: DispatchWindowContext[] = [];

    // Use selectedWindows from rental requests if available
    const firstRentalRequest = rentalItems[0];
    const selectedWindows = firstRentalRequest?.selectedWindows;

    if (outboundBaseDate) {
      let window: DerivedDispatchWindow;
      if (selectedWindows?.outboundDeliveryWindow) {
        window = {
          window: selectedWindows.outboundDeliveryWindow,
          baseDate: getLagosDateString(
            selectedWindows.outboundDeliveryWindow.start,
          ),
          scheduledDate: getLagosDateString(
            selectedWindows.outboundDeliveryWindow.start,
          ),
          rolledForwardDays: 0,
        };
      } else {
        window = deriveDefaultDispatchWindow(outboundBaseDate, {
          allowRollForward: false,
        });
      }
      contexts.push({
        type: "OUTBOUND",
        title: "Delivery",
        subtitle: "",
        baseDateLabel: formatLagosDate(outboundBaseDate, {
          includeWeekday: true,
        }),
        baseDateReason: "",
        helperText: "",
        suggested: window,
        allowDateChange: false,
        minDate: window.scheduledDate,
        defaultSummary: formatWindowRange(window.window),
      });
    }

    if (returnBaseDate) {
      let window: DerivedDispatchWindow;
      if (selectedWindows?.returnPickupWindow) {
        window = {
          window: selectedWindows.returnPickupWindow,
          baseDate: getLagosDateString(returnBaseDate),
          scheduledDate: getLagosDateString(returnBaseDate),
          rolledForwardDays: 0,
        };
      } else {
        window = deriveDefaultDispatchWindow(returnBaseDate, {
          allowRollForward: false,
        });
      }
      contexts.push({
        type: "RETURN",
        title: "Return pickup",
        subtitle: "",
        baseDateLabel: formatLagosDate(returnBaseDate, {
          includeWeekday: true,
        }),
        baseDateReason: "",
        helperText: "",
        suggested: window,
        allowDateChange: false,
        minDate: window.scheduledDate,
        defaultSummary: formatWindowRange(window.window),
      });
    }

    if (resaleItems.length > 0) {
      const savedResaleWindow = pickResaleWindowFromCheckoutItem(resaleItems[0]);

      if (savedResaleWindow) {
        const scheduledDate = getLagosDateString(savedResaleWindow.start);
        const baseDate = getLagosDateString(savedResaleWindow.start);
        const suggested: DerivedDispatchWindow = {
          window: savedResaleWindow,
          baseDate,
          scheduledDate,
          rolledForwardDays: 0,
        };
        contexts.push({
          type: "RESALE",
          title: "Delivery",
          subtitle: "",
          baseDateLabel: formatLagosDate(savedResaleWindow.start, {
            includeWeekday: true,
          }),
          baseDateReason: "",
          helperText: "",
          suggested,
          allowDateChange: true,
          minDate: scheduledDate,
          defaultSummary: formatWindowRange(savedResaleWindow),
        });
      } else {
        const now = new Date();
        const suggested = deriveDefaultDispatchWindow(now, {
          allowRollForward: true,
        });
        contexts.push({
          type: "RESALE",
          title: "Delivery",
          subtitle: "",
          baseDateLabel: formatLagosDate(now, { includeWeekday: true }),
          baseDateReason: "",
          helperText: "",
          suggested,
          allowDateChange: true,
          minDate: suggested.scheduledDate,
          defaultSummary: formatWindowRange(suggested.window),
        });
      }
    }

    return contexts;
  }, [
    outboundBaseDate,
    returnBaseDate,
    resaleItems,
    rentalItems,
    dispatchScheduleClock,
  ]);

  useEffect(() => {
    if (dispatchContexts.length === 0) {
      setDispatchSelections({});
      return;
    }
    setDispatchSelections((prev) => {
      const next: DispatchWindowSelectionMap = { ...prev };
      let changed = false;
      dispatchContexts.forEach((ctx) => {
        const existing = next[ctx.type];
        if (!existing) {
          next[ctx.type] = {
            type: ctx.type,
            window: ctx.suggested.window,
            mode: "DEFAULT",
            baseDate: ctx.suggested.baseDate,
            scheduledDate: ctx.suggested.scheduledDate,
            rolledForwardDays: ctx.suggested.rolledForwardDays,
          } satisfies DispatchWindowSelection;
          changed = true;
          return;
        }
        if (
          existing.mode === "DEFAULT" &&
          (existing.window.start !== ctx.suggested.window.start ||
            existing.scheduledDate !== ctx.suggested.scheduledDate ||
            existing.rolledForwardDays !== ctx.suggested.rolledForwardDays)
        ) {
          next[ctx.type] = {
            type: ctx.type,
            window: ctx.suggested.window,
            mode: "DEFAULT",
            baseDate: ctx.suggested.baseDate,
            scheduledDate: ctx.suggested.scheduledDate,
            rolledForwardDays: ctx.suggested.rolledForwardDays,
          } satisfies DispatchWindowSelection;
          changed = true;
        }
      });

      Object.keys(next).forEach((typeKey) => {
        if (!dispatchContexts.some((ctx) => ctx.type === typeKey)) {
          delete next[typeKey as ShipmentDispatchType];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [dispatchContexts]);

  const handleDispatchSelectionChange = useCallback(
    (
      type: ShipmentDispatchType,
      selection: DispatchWindowSelection | undefined,
    ) => {
      setDispatchSelections((prev) => {
        const next = { ...prev };
        if (!selection) {
          delete next[type];
        } else {
          next[type] = selection;
        }
        return next;
      });
    },
    [],
  );

  const groupedByLister = useMemo(() => {
    return approvedOnCheckout.reduce((acc: Map<string, any[]>, item: any) => {
      const listerId =
        (item.listerId as string | undefined)?.trim() || "unknown-lister";
      if (!acc.has(listerId)) {
        acc.set(listerId, []);
      }
      acc.get(listerId)!.push(item);
      return acc;
    }, new Map());
  }, [approvedOnCheckout]);

  const listerGroups = useMemo(
    () =>
      [...groupedByLister.entries()].map(([listerId, items]) => ({
        listerId,
        items,
      })),
    [groupedByLister],
  );

  const selectedTierData = useMemo(
    () => shippingTiers.find((t) => t.name === selectedShippingTier),
    [shippingTiers, selectedShippingTier],
  );

  return (
    <div className="mx-auto px-4 sm:px-0 py-[70px] sm:py-[100px] container">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <Header1Plus className="mb-8 uppercase">CHECKOUT</Header1Plus>
      <div className="gap-4 sm:gap-8 grid grid-cols-1 xl:grid-cols-3 xl:gap-16">
        <div className="min-w-0 xl:col-span-2">
          <CheckoutContactAndPayment
            onShippingTierSelected={setSelectedShippingTier}
            shippingTiers={shippingTiers}
            dispatchContexts={dispatchContexts}
            dispatchSelections={dispatchSelections}
            onDispatchSelectionChange={handleDispatchSelectionChange}
            returnPickupAddress={returnPickupAddress}
            onReturnPickupChange={handleReturnPickupAddressChange}
            isResaleOnly={
              cartData?.items?.every(
                (item: any) => item.isResale || item.days === 0,
              ) || false
            }
          />
        </div>
        <div className="min-w-0 xl:col-span-1">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={isLoading || cartIsLoading}
            error={error instanceof Error ? error : null}
            selectedShippingTier={selectedShippingTier}
            selectedTierData={selectedTierData}
            dispatchSelections={dispatchSelections}
            returnPickupAddress={returnPickupAddress}
          />
        </div>
      </div>
    </div>
  );
}
