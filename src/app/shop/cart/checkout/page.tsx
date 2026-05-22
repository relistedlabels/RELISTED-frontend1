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
  canonicalReturnPickupJson,
  type CheckoutShipmentBucket,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";
import { useCheckoutOrderSummary } from "@/lib/queries/order/useCheckoutOrderSummary";
import { useProfile } from "@/lib/queries/user/useProfile";
import { approvedRentalsMatchingCurrentCart } from "@/lib/cart/approvedRentalsMatchingCart";
import {
  isCheckoutRentalLine,
  isCheckoutResalePurchaseLine,
} from "@/lib/cart/checkoutLineKind";
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
  getTodayInLagos,
  addDaysToDateString,
  type ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import type { DispatchWindowContext } from "@/lib/checkout/dispatchWindows";
import { useDispatchScheduleClock } from "@/lib/checkout/useDispatchScheduleClock";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  closetDispatchAnchorDate,
  getClosetEarliestDeliveryLagosYmd,
  lagosYmdMax,
  publicProductHasCloset,
} from "@/lib/vaultClosetSaleDates";

const RETURN_PICKUP_SUMMARY_DEBOUNCE_MS = 1000;

const EMPTY_SHIPPING_TIERS: Array<{
  name: string;
  totalShippingCost: number;
  grandTotal: number;
}> = [];

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

function checkoutItemHasCloset(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  const detail = o.productDetail ?? o.product;
  return publicProductHasCloset(
    detail as { closetId?: string | null; closet?: { id: string } | null },
  );
}

/** Earliest scheduled window start in a shipment bucket (for chronological ordering on checkout). */
function bucketEarliestWindowStartMs(
  bucket: CheckoutShipmentBucket,
): number {
  const parse = (iso: string | undefined) => {
    if (!iso?.trim()) return NaN;
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : NaN;
  };
  if (bucket.bucketMode === "RENTAL") {
    const times = [
      parse(bucket.outboundDeliveryWindow?.start),
      parse(bucket.returnPickupWindow?.start),
    ].filter((n) => Number.isFinite(n));
    return times.length ? Math.min(...times) : Number.POSITIVE_INFINITY;
  }
  if (bucket.bucketMode === "RESALE") {
    const t = parse(bucket.resaleDeliveryWindow?.start);
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
  }
  return Number.POSITIVE_INFINITY;
}

export default function CheckoutPage() {
  const [selectedShippingTier, setSelectedShippingTier] = useState<string>("");
  const [selectedReturnShippingTier, setSelectedReturnShippingTier] =
    useState<string>("");
  const [selectedOutboundTierByBucket, setSelectedOutboundTierByBucket] =
    useState<Record<number, string>>({});
  const [selectedReturnTierByBucket, setSelectedReturnTierByBucket] = useState<
    Record<number, string>
  >({});

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
      setReturnPickupAddress((prev) => {
        if (prev === value) return prev;
        if (!prev && !value) return prev;
        if (
          prev &&
          value &&
          canonicalReturnPickupJson(prev) === canonicalReturnPickupJson(value)
        ) {
          return prev;
        }
        return value;
      });
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

  const returnPickupForSummary = useDebouncedValue(
    returnPickupAddress,
    RETURN_PICKUP_SUMMARY_DEBOUNCE_MS,
  );

  const { data: profile } = useProfile();
  const deliveryAddressForSummary = useMemo(
    () => ({
      street: profile?.address?.street,
      city: profile?.address?.city,
      state: profile?.address?.state,
      zipCode: profile?.address?.zipCode ?? undefined,
    }),
    [
      profile?.address?.street,
      profile?.address?.city,
      profile?.address?.state,
      profile?.address?.zipCode,
    ],
  );

  const orderSummaryQuery = useCheckoutOrderSummary(
    returnPickupForSummary,
    deliveryAddressForSummary,
  );
  const orderSummaryErrorMessage = useMemo(() => {
    if (!orderSummaryQuery.isError) return null;
    const e = orderSummaryQuery.error;
    if (e instanceof Error && e.message.trim()) return e.message;
    return "Could not load your payment summary.";
  }, [orderSummaryQuery.isError, orderSummaryQuery.error]);
  const shippingQuoteWarnings =
    orderSummaryQuery.data?.data?.shippingQuoteWarnings ?? [];
  const shippingTiers =
    orderSummaryQuery.data?.data?.shippingTiers ?? EMPTY_SHIPPING_TIERS;
  const returnShippingTiers =
    orderSummaryQuery.data?.data?.returnShippingTiers ?? EMPTY_SHIPPING_TIERS;
  const outboundShippingByBucket =
    orderSummaryQuery.data?.data?.outboundShippingByBucket ?? [];
  const returnShippingByBucket =
    orderSummaryQuery.data?.data?.returnShippingByBucket ?? [];
  const useOutboundByBucket = outboundShippingByBucket.length > 0;

  const outboundBucketsSyncKey = useMemo(
    () =>
      outboundShippingByBucket
        .map(
          (b) =>
            `${b.bucketIndex}:${b.shippingTiers.map((t) => `${t.name}:${t.totalShippingCost}`).join(",")}`,
        )
        .join("|"),
    [outboundShippingByBucket],
  );

  const returnBucketsSyncKey = useMemo(
    () =>
      returnShippingByBucket
        .map(
          (b) =>
            `${b.bucketIndex}:${b.shippingTiers.map((t) => `${t.name}:${t.totalShippingCost}`).join(",")}`,
        )
        .join("|"),
    [returnShippingByBucket],
  );

  useEffect(() => {
    if (!useOutboundByBucket) return;
    setSelectedOutboundTierByBucket((prev) => {
      const next: Record<number, string> = { ...prev };
      for (const b of outboundShippingByBucket) {
        const cur = next[b.bucketIndex];
        const valid =
          cur && b.shippingTiers.some((t: { name: string }) => t.name === cur);
        if (!valid) next[b.bucketIndex] = b.shippingTiers[0]?.name ?? "";
      }
      for (const k of Object.keys(next)) {
        const ki = Number(k);
        if (!outboundShippingByBucket.some((b) => b.bucketIndex === ki))
          delete next[ki];
      }
      return next;
    });
  }, [outboundBucketsSyncKey, useOutboundByBucket, outboundShippingByBucket]);

  useEffect(() => {
    if (shippingTiers.length === 0 || useOutboundByBucket) return;
    setSelectedShippingTier((prev) => {
      const stillValid =
        prev && shippingTiers.some((t: { name: string }) => t.name === prev);
      return stillValid ? prev : shippingTiers[0].name;
    });
  }, [shippingTiers, useOutboundByBucket]);

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

  const cartItems = cartData?.items;

  const approvedOnCheckout = useMemo(() => {
    const fromRentals = approvedRentalsMatchingCurrentCart(
      cartItemsWithProduct,
      cartItems,
    );
    // Only dedupe cart resale lines when the same product is an active rental on this cart.
    const rentalProductIds = new Set(
      fromRentals
        .filter((item) => isCheckoutRentalLine(item, cartItems))
        .map((item) => item.productId),
    );
    const uniqueResaleItems = resaleItemsWithProduct.filter(
      (item) => !rentalProductIds.has(item.productId),
    );
    return [...fromRentals, ...uniqueResaleItems];
  }, [cartItemsWithProduct, cartItems, resaleItemsWithProduct]);

  const rentalItems = useMemo(
    () =>
      approvedOnCheckout.filter((item) =>
        isCheckoutRentalLine(item, cartItems),
      ),
    [approvedOnCheckout, cartItems],
  );

  const hasReturnShippingLeg = rentalItems.length > 0;

  useEffect(() => {
    if (
      !hasReturnShippingLeg ||
      returnShippingByBucket.length === 0
    )
      return;
    setSelectedReturnTierByBucket((prev) => {
      const next: Record<number, string> = { ...prev };
      for (const b of returnShippingByBucket) {
        const cur = next[b.bucketIndex];
        const valid =
          cur && b.shippingTiers.some((t: { name: string }) => t.name === cur);
        if (!valid) next[b.bucketIndex] = b.shippingTiers[0]?.name ?? "";
      }
      for (const k of Object.keys(next)) {
        const ki = Number(k);
        if (!returnShippingByBucket.some((b) => b.bucketIndex === ki))
          delete next[ki];
      }
      return next;
    });
  }, [
    returnBucketsSyncKey,
    hasReturnShippingLeg,
    returnShippingByBucket,
  ]);

  useEffect(() => {
    if (
      !hasReturnShippingLeg ||
      returnShippingByBucket.length > 0 ||
      returnShippingTiers.length === 0
    )
      return;
    setSelectedReturnShippingTier((prev) => {
      const stillValid =
        prev &&
        returnShippingTiers.some((t: { name: string }) => t.name === prev);
      return stillValid ? prev : returnShippingTiers[0].name;
    });
  }, [
    returnShippingTiers,
    hasReturnShippingLeg,
    returnShippingByBucket.length,
  ]);

  const resaleItems = useMemo(
    () =>
      approvedOnCheckout.filter((item) =>
        isCheckoutResalePurchaseLine(item, cartItems),
      ),
    [approvedOnCheckout, cartItems],
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

    let outboundDerived: DerivedDispatchWindow | undefined;

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
      outboundDerived = window;
      contexts.push({
        type: "OUTBOUND",
        title: "Rental delivery",
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
      const hasClosetResale = resaleItems.some(checkoutItemHasCloset);
      const closetResaleMinYmd = hasClosetResale
        ? lagosYmdMax(getTodayInLagos(), getClosetEarliestDeliveryLagosYmd())
        : undefined;

      let resaleSuggested: DerivedDispatchWindow;
      if (savedResaleWindow) {
        const scheduledDate = getLagosDateString(savedResaleWindow.start);
        const baseDate = getLagosDateString(savedResaleWindow.start);
        resaleSuggested = {
          window: savedResaleWindow,
          baseDate,
          scheduledDate,
          rolledForwardDays: 0,
        };
      } else {
        const anchor = hasClosetResale ? closetDispatchAnchorDate() : new Date();
        resaleSuggested = deriveDefaultDispatchWindow(anchor, {
          allowRollForward: true,
        });
      }

      const resaleMinDate = closetResaleMinYmd
        ? lagosYmdMax(resaleSuggested.scheduledDate, closetResaleMinYmd)
        : resaleSuggested.scheduledDate;

      const outboundWin = outboundDerived?.window;
      const resaleWin = resaleSuggested.window;
      const resaleUsesSameSlotAsRentalOutbound =
        outboundWin &&
        resaleWin.start === outboundWin.start &&
        resaleWin.end === outboundWin.end;

      // Mixed cart: one UI row when rental outbound and resale share the same slot (same lister flow).
      // Selection syncing still mirrors RESALE onto OUTBOUND for passCart (see effect below).
      if (!resaleUsesSameSlotAsRentalOutbound) {
        if (savedResaleWindow) {
          contexts.push({
            type: "RESALE",
            title: "Purchase delivery",
            subtitle: "",
            baseDateLabel: formatLagosDate(savedResaleWindow.start, {
              includeWeekday: true,
            }),
            baseDateReason: hasClosetResale
              ? "Earliest delivery is Monday 18 May"
              : "",
            helperText: "",
            suggested: resaleSuggested,
            allowDateChange: true,
            minDate: resaleMinDate,
            defaultSummary: formatWindowRange(savedResaleWindow),
          });
        } else {
          contexts.push({
            type: "RESALE",
            title: "Purchase delivery",
            subtitle: "",
            baseDateLabel: formatLagosDate(resaleSuggested.window.start, {
              includeWeekday: true,
            }),
            baseDateReason: hasClosetResale
              ? "Earliest delivery is Monday 18 May"
              : "",
            helperText: "",
            suggested: resaleSuggested,
            allowDateChange: true,
            minDate: resaleMinDate,
            defaultSummary: formatWindowRange(resaleSuggested.window),
          });
        }
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

    const mirrorResaleSelectionFromOutbound =
      rentalItems.length > 0 &&
      resaleItems.length > 0 &&
      dispatchContexts.some((c) => c.type === "OUTBOUND") &&
      !dispatchContexts.some((c) => c.type === "RESALE");

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

      if (mirrorResaleSelectionFromOutbound && next.OUTBOUND) {
        const mirrored: DispatchWindowSelection = {
          ...next.OUTBOUND,
          type: "RESALE",
        };
        const cur = next.RESALE;
        if (
          !cur ||
          cur.window.start !== mirrored.window.start ||
          cur.window.end !== mirrored.window.end ||
          cur.mode !== mirrored.mode ||
          cur.scheduledDate !== mirrored.scheduledDate
        ) {
          next.RESALE = mirrored;
          changed = true;
        }
      }

      Object.keys(next).forEach((typeKey) => {
        const t = typeKey as ShipmentDispatchType;
        if (!dispatchContexts.some((ctx) => ctx.type === t)) {
          if (t === "RESALE" && mirrorResaleSelectionFromOutbound) return;
          delete next[t];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [dispatchContexts, rentalItems.length, resaleItems.length]);

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

  /** Resolve bucket `productIds` to titles from approved checkout lines. */
  const productLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const item of approvedOnCheckout as Array<Record<string, unknown>>) {
      const pid =
        typeof item.productId === "string" ? item.productId.trim() : "";
      if (!pid) continue;
      const detail = item.productDetail as { name?: string } | undefined;
      const name =
        (typeof detail?.name === "string" && detail.name.trim()) ||
        (typeof item.productName === "string" && item.productName.trim()) ||
        "";
      if (name) m.set(pid, name);
    }
    return m;
  }, [approvedOnCheckout]);

  /** Matches GET /order/summary `shipmentBuckets` for DISPATCH WINDOWS (multi-leg aware). */
  const summaryDispatchPreview = useMemo(() => {
    const buckets = orderSummaryQuery.data?.data
      ?.shipmentBuckets as CheckoutShipmentBucket[] | undefined;
    if (!buckets?.length) return undefined;

    const itemTitlesSuffix = (bucket: CheckoutShipmentBucket): string => {
      const ids = bucket.productIds;
      if (!ids?.length) return "";
      const labels = ids
        .map((id) => productLabelById.get(id))
        .filter((x): x is string => Boolean(x?.trim()));
      if (!labels.length) return "";
      return ` · ${labels.join(", ")}`;
    };
    const bucketGroupKey = (bucket: CheckoutShipmentBucket) => {
      const id = bucket.listerId?.trim();
      if (id) return id;
      const name = bucket.listerName?.trim().toLowerCase();
      return name ? `name:${name}` : "";
    };
    const bucketsChronological = [...buckets].sort((a, b) => {
      const ta = bucketEarliestWindowStartMs(a);
      const tb = bucketEarliestWindowStartMs(b);
      if (ta !== tb) return ta - tb;
      const la = `${a.listerId ?? ""}:${a.listerName ?? ""}:${a.bucketMode}`;
      const lb = `${b.listerId ?? ""}:${b.listerName ?? ""}:${b.bucketMode}`;
      return la.localeCompare(lb);
    });

    const bucketsPerGroup = bucketsChronological.reduce((acc, bucket) => {
      const key = bucketGroupKey(bucket);
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
    const listerLegIndex = new Map<string, number>();
    const formatListerLocation = (bucket: CheckoutShipmentBucket): string => {
      const city = bucket.listerCity?.trim();
      const state = bucket.listerState?.trim();
      if (city && state && city.toLowerCase() !== state.toLowerCase()) {
        return `${city}, ${state}`;
      }
      return city || state || "";
    };

    const groups: Array<{
      groupHeading: string | null;
      listerLocation?: string;
      rows: Array<{ title: string; range: string }>;
    }> = [];
    for (const b of bucketsChronological) {
      const groupKey = bucketGroupKey(b);
      const severalLegsForGroup =
        groupKey !== "" && (bucketsPerGroup.get(groupKey) ?? 0) > 1;
      const listerDisplay = b.listerName?.trim() || "Lister";
      const itemSuffix = itemTitlesSuffix(b);
      let groupHeading: string;
      if (severalLegsForGroup) {
        const next = (listerLegIndex.get(groupKey) ?? 0) + 1;
        listerLegIndex.set(groupKey, next);
        groupHeading = `Order from ${listerDisplay} · ${next}${itemSuffix}`;
      } else {
        groupHeading = `Order from ${listerDisplay}${itemSuffix}`;
      }

      const bucketRows: Array<{ title: string; range: string }> = [];
      if (b.bucketMode === "RENTAL") {
        const ob = b.outboundDeliveryWindow;
        const ret = b.returnPickupWindow;
        if (ob?.start && ob?.end) {
          bucketRows.push({
            title: "Rental delivery",
            range: formatWindowRange(ob),
          });
        }
        if (ret?.start && ret?.end) {
          bucketRows.push({
            title: "Return pickup",
            range: formatWindowRange(ret),
          });
        }
      } else if (b.bucketMode === "RESALE") {
        const rw = b.resaleDeliveryWindow;
        if (rw?.start && rw?.end) {
          bucketRows.push({
            title: "Purchase delivery",
            range: formatWindowRange(rw),
          });
        }
      }
      if (bucketRows.length > 0) {
        const listerLocation = formatListerLocation(b);
        groups.push({
          groupHeading,
          ...(listerLocation ? { listerLocation } : {}),
          rows: bucketRows,
        });
      }
    }
    return groups.length > 0 ? groups : undefined;
  }, [orderSummaryQuery.data?.data?.shipmentBuckets, productLabelById]);

  const checkoutBlockingIssues: string[] = [];

  const selectedTierData = useMemo(
    () =>
      shippingTiers.find(
        (t: { name: string }) => t.name === selectedShippingTier,
      ),
    [shippingTiers, selectedShippingTier],
  );

  const selectedReturnTierData = useMemo(
    () =>
      returnShippingTiers.find(
        (t: { name: string }) => t.name === selectedReturnShippingTier,
      ),
    [returnShippingTiers, selectedReturnShippingTier],
  );

  return (
    <div className="mx-auto px-4 sm:px-0 py-[70px] sm:py-[100px] container">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <Header1Plus className="mb-8 uppercase">CHECKOUT</Header1Plus>
      <div className="gap-4 sm:gap-8 xl:gap-16 grid grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 min-w-0">
          <CheckoutContactAndPayment
            orderSummary={orderSummaryQuery.data}
            onShippingTierSelected={setSelectedShippingTier}
            shippingTiers={shippingTiers}
            selectedShippingTier={selectedShippingTier}
            outboundShippingByBucket={outboundShippingByBucket}
            selectedOutboundTierByBucket={selectedOutboundTierByBucket}
            onOutboundTierForBucket={(bucketIndex, tierName) =>
              setSelectedOutboundTierByBucket((prev) => ({
                ...prev,
                [bucketIndex]: tierName,
              }))
            }
            returnShippingTiers={returnShippingTiers}
            returnShippingByBucket={returnShippingByBucket}
            selectedReturnShippingTier={selectedReturnShippingTier}
            selectedReturnTierByBucket={selectedReturnTierByBucket}
            onReturnShippingTierSelected={setSelectedReturnShippingTier}
            onReturnTierForBucket={(bucketIndex, tierName) =>
              setSelectedReturnTierByBucket((prev) => ({
                ...prev,
                [bucketIndex]: tierName,
              }))
            }
            showReturnShippingTierPicker={hasReturnShippingLeg}
            isShippingTiersLoading={orderSummaryQuery.isLoading}
            dispatchContexts={dispatchContexts}
            dispatchSelections={dispatchSelections}
            onDispatchSelectionChange={handleDispatchSelectionChange}
            returnPickupAddress={returnPickupAddress}
            onReturnPickupChange={handleReturnPickupAddressChange}
            checkoutBlockingIssues={checkoutBlockingIssues}
            summaryDispatchPreview={summaryDispatchPreview}
            orderSummaryError={orderSummaryErrorMessage}
            shippingQuoteWarnings={shippingQuoteWarnings}
            onRefetchOrderSummary={() => {
              void orderSummaryQuery.refetch();
            }}
            isResaleOnly={
              (cartItems?.length ?? 0) > 0 &&
              cartItems!.every((item) =>
                isCheckoutResalePurchaseLine(
                  {
                    cartItemId: item.id,
                    rentalDays: item.days,
                    productDetail: {
                      listingType: item.product?.listingType as
                        | "RENTAL"
                        | "RESALE"
                        | "RENT_OR_RESALE"
                        | undefined,
                    },
                  },
                  cartItems,
                ),
              )
            }
          />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={isLoading || cartIsLoading}
            error={error instanceof Error ? error : null}
            selectedShippingTier={selectedShippingTier}
            selectedTierData={selectedTierData}
            outboundShippingByBucket={outboundShippingByBucket}
            selectedOutboundTierByBucket={selectedOutboundTierByBucket}
            hasReturnShippingLeg={hasReturnShippingLeg}
            selectedReturnShippingTier={selectedReturnShippingTier}
            selectedReturnTierData={selectedReturnTierData}
            returnShippingByBucket={returnShippingByBucket}
            selectedReturnTierByBucket={selectedReturnTierByBucket}
            dispatchSelections={dispatchSelections}
            returnPickupAddress={returnPickupAddress}
            orderSummary={orderSummaryQuery.data}
            orderSummaryLoading={orderSummaryQuery.isLoading}
            orderSummaryError={orderSummaryErrorMessage}
            onRefetchOrderSummary={() => {
              void orderSummaryQuery.refetch();
            }}
            checkoutBlockingIssues={checkoutBlockingIssues}
          />
        </div>
      </div>
    </div>
  );
}
