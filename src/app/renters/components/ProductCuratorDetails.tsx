"use client";

import React from "react";
import { Package, Star } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { isListerResaleOrder } from "@/lib/listers/listerOrderRow";

const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "0";
  return Number(amount).toLocaleString("en-NG");
};
const CURRENCY = "₦";

interface ProductCuratorDetailsProps {
  orderData?: any;
}

function isResaleLine(line: { days?: number; rentalDays?: number; listingType?: string }) {
  const days = Number(line.days ?? line.rentalDays ?? 0);
  const lt = String(line.listingType ?? "");
  if (lt === "RESALE") return true;
  if (lt === "RENT_OR_RESALE" && days === 0) return true;
  return false;
}

export default function ProductCuratorDetails({
  orderData,
}: ProductCuratorDetailsProps) {
  if (!orderData) {
    return (
      <div className="text-center py-8 text-red-500">
        <Paragraph1>No order data available</Paragraph1>
      </div>
    );
  }

  const items: Array<{
    id?: string;
    name?: string;
    price?: number;
    imageUrl?: string | null;
    quantity?: number;
    rentalDays?: number;
    days?: number;
    listingType?: string;
    rentalFee?: number;
    resalePrice?: number | null;
    resaleListerAmount?: number | null;
    cleaningFee?: number;
    collateralFee?: number;
    rentalStartDate?: string | null;
    rentalEndDate?: string | null;
    returnDueDate?: string | null;
  }> = Array.isArray(orderData.items) ? orderData.items : [];

  const orderDeliveryFee = orderData.deliveryFee || 0;
  const orderServiceFee = orderData.serviceFee || 0;
  const orderVatAmount = Number(orderData.vatAmount ?? 0) || 0;
  const orderTotalAmount = orderData.totalAmount || 0;
  const mb = orderData.merchandiseBreakdown as
    | {
        rentalSubtotal?: number;
        cleaningFeesTotal?: number;
        resaleSubtotal?: number;
        total?: number;
      }
    | undefined;

  const listerInfo = {
    name: orderData.lister?.businessName || "Lister",
    avatar: orderData.lister?.imageUrl || "",
    rating: orderData.lister?.rating || 0,
    totalRentals: 0,
  };

  const formatShortRange = (start?: string | null, end?: string | null) => {
    if (!start || !end) return null;
    const a = new Date(start).toLocaleDateString("en-NG", {
      timeZone: "Africa/Lagos",
      month: "short",
      day: "numeric",
    });
    const b = new Date(end).toLocaleDateString("en-NG", {
      timeZone: "Africa/Lagos",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${a} to ${b}`;
  };

  const formatSingleDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-NG", {
          timeZone: "Africa/Lagos",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  /** Last calendar day of rental is often stored as `rentalEndDate`; return is due the following day. */
  const formatReturnDueLabel = (
    returnDueIso?: string | null,
    rentalEnd?: string | null,
  ) => {
    if (returnDueIso) return formatSingleDate(returnDueIso);
    if (!rentalEnd) return null;
    const end = new Date(rentalEnd);
    if (Number.isNaN(end.getTime())) return null;
    const next = new Date(end.getTime());
    next.setDate(next.getDate() + 1);
    return formatSingleDate(next.toISOString());
  };

  const collateralSum = items.reduce((s, l) => {
    if (isResaleLine(l)) return s;
    return s + Number(l.collateralFee ?? 0);
  }, 0);

  const itemsSubtotalFromLines = items.reduce(
    (s, l) =>
      s + Number(l.rentalFee ?? 0) + Number(l.cleaningFee ?? 0),
    0,
  );
  const itemsSubtotal =
    mb && typeof mb.total === "number" && !Number.isNaN(mb.total)
      ? mb.total
      : itemsSubtotalFromLines;

  /** Align service fee with `totalAmount` when legacy orders stored 10% of (rent+cleaning) instead of 10% of rent. */
  const sumWithStatedService =
    itemsSubtotal +
    collateralSum +
    orderDeliveryFee +
    orderServiceFee +
    orderVatAmount;
  let serviceFeeDisplay = orderServiceFee;
  if (Math.abs(orderTotalAmount - sumWithStatedService) > 1) {
    serviceFeeDisplay = Math.max(
      0,
      orderTotalAmount -
        itemsSubtotal -
        collateralSum -
        orderDeliveryFee -
        orderVatAmount,
    );
  }
  const sumFinal =
    itemsSubtotal +
    collateralSum +
    orderDeliveryFee +
    serviceFeeDisplay +
    orderVatAmount;
  const otherAdjust = orderTotalAmount - sumFinal;

  const resaleOnlyOrder = isListerResaleOrder(orderData);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <Paragraph1 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Your items ({items.length})
          </Paragraph1>
        </div>

        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No line items</div>
          ) : (
            items.map((line, index) => {
              const key =
                line.id != null ? `${String(line.id)}-${index}` : `item-${index}`;
              const start = line.rentalStartDate ?? orderData.rentalStartDate;
              const end = line.rentalEndDate ?? orderData.rentalEndDate;
              const days = Number(line.rentalDays ?? line.days ?? 0);
              const resale = isResaleLine(line);
              const linePrice = resale
                ? Number(
                    line.resalePrice ??
                      line.resaleListerAmount ??
                      line.rentalFee ??
                      0,
                  )
                : Number(line.rentalFee ?? 0);
              const periodLabel = formatShortRange(start, end);
              const returnLabel = formatReturnDueLabel(
                line.returnDueDate ?? null,
                end ?? null,
              );

              return (
                <div key={key} className="p-4 flex gap-3 sm:gap-4">
                  <div className="relative w-20 h-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt={line.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Paragraph1 className="text-base font-semibold text-gray-900 leading-snug">
                      {line.name || "Item"}
                    </Paragraph1>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {resale ? (
                        <>Purchase</>
                      ) : (
                        <>
                          Qty {line.quantity ?? 1}
                          {days > 0 ? (
                            <>
                              {" "}
                              · {days} day{days === 1 ? "" : "s"}
                              {typeof line.price === "number" && line.price > 0
                                ? ` · ${CURRENCY}${formatCurrency(line.price)}/day`
                                : null}
                            </>
                          ) : null}
                        </>
                      )}
                    </p>
                    {!resale && (periodLabel || returnLabel) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                        {periodLabel ? (
                          <div>
                            <span className="text-gray-400">Rental period</span>{" "}
                            <span className="font-medium text-gray-800">
                              {periodLabel}
                            </span>
                          </div>
                        ) : null}
                        {returnLabel ? (
                          <div>
                            <span className="text-gray-400">Return due</span>{" "}
                            <span className="font-medium text-gray-800">
                              {returnLabel}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1 border-t border-gray-100">
                      <span className="text-gray-500">
                        {resale ? "Price" : "Rental"}{" "}
                        <span className="font-semibold text-gray-900">
                          {CURRENCY}
                          {formatCurrency(linePrice)}
                        </span>
                      </span>
                      {!resale && Number(line.cleaningFee) > 0 ? (
                        <span className="text-gray-500">
                          Cleaning{" "}
                          <span className="font-semibold text-gray-900">
                            {CURRENCY}
                            {formatCurrency(line.cleaningFee)}
                          </span>
                        </span>
                      ) : null}
                      {!resale && Number(line.collateralFee) > 0 ? (
                        <span className="text-gray-500">
                          Collateral{" "}
                          <span className="font-semibold text-gray-900">
                            {CURRENCY}
                            {formatCurrency(line.collateralFee)}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Merchandise</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {CURRENCY}
              {formatCurrency(itemsSubtotal)}
            </span>
          </div>
          {collateralSum > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span className="leading-snug">
                Collateral (held in escrow)
                <span className="block text-[11px] font-normal text-gray-500 normal-case">
                  Included in total paid; released after return.
                </span>
              </span>
              <span className="font-semibold text-gray-900 tabular-nums shrink-0">
                {CURRENCY}
                {formatCurrency(collateralSum)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-gray-600">
            <span>{resaleOnlyOrder ? "Delivery" : "Delivery & return"}</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {CURRENCY}
              {formatCurrency(orderDeliveryFee)}
            </span>
          </div>
          {orderVatAmount > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>VAT</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {CURRENCY}
                {formatCurrency(orderVatAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Service fee</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {CURRENCY}
              {formatCurrency(serviceFeeDisplay)}
            </span>
          </div>
          {Math.abs(otherAdjust) > 1 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Adjustments</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {CURRENCY}
                {formatCurrency(otherAdjust)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 pt-2 border-t border-gray-200 text-gray-900 font-semibold">
            <span>Total paid</span>
            <span className="tabular-nums">
              {CURRENCY}
              {formatCurrency(orderTotalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
              {listerInfo.avatar ? (
                <img
                  src={listerInfo.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-gray-600">
                  {listerInfo.name?.charAt(0) || "L"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <Paragraph1 className="text-sm font-semibold text-gray-900 truncate">
                {listerInfo.name}
              </Paragraph1>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(listerInfo.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                <span className="ml-1 text-xs text-gray-600">
                  {listerInfo.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
