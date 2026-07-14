"use client";

import React from "react";
import { ChevronDown, Package } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { isListerResaleOrder } from "@/lib/listers/listerOrderRow";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

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

function formatShortRange(start?: string | null, end?: string | null) {
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
  });
  return `${a} – ${b}`;
}

function formatReturnDue(returnDueIso?: string | null, rentalEnd?: string | null) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-NG", {
      timeZone: "Africa/Lagos",
      month: "short",
      day: "numeric",
    });
  if (returnDueIso) return fmt(returnDueIso);
  if (!rentalEnd) return null;
  const end = new Date(rentalEnd);
  if (Number.isNaN(end.getTime())) return null;
  const next = new Date(end.getTime());
  next.setDate(next.getDate() + 1);
  return fmt(next.toISOString());
}

export default function ProductCuratorDetails({
  orderData,
}: ProductCuratorDetailsProps) {
  if (!orderData) return null;

  const items: Array<{
    id?: string;
    name?: string;
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

  const listerName = orderData.lister?.businessName || "Lister";
  const listerAvatar = orderData.lister?.imageUrl || "";

  const collateralSum = items.reduce((s, l) => {
    if (isResaleLine(l)) return s;
    return s + Number(l.collateralFee ?? 0);
  }, 0);

  const rentalSubtotalFromLines = items.reduce((s, l) => {
    if (isResaleLine(l)) return s;
    return s + Number(l.rentalFee ?? 0);
  }, 0);
  const cleaningFeesFromLines = items.reduce((s, l) => {
    if (isResaleLine(l)) return s;
    return s + Number(l.cleaningFee ?? 0);
  }, 0);
  const resaleSubtotalFromLines = items.reduce((s, l) => {
    if (!isResaleLine(l)) return s;
    return (
      s +
      Number(l.resalePrice ?? l.resaleListerAmount ?? l.rentalFee ?? 0)
    );
  }, 0);

  const rentalSubtotal = mb?.rentalSubtotal ?? rentalSubtotalFromLines;
  const cleaningFeesTotal = mb?.cleaningFeesTotal ?? cleaningFeesFromLines;
  const resaleSubtotal = mb?.resaleSubtotal ?? resaleSubtotalFromLines;
  const merchandiseTotal =
    mb && typeof mb.total === "number" && !Number.isNaN(mb.total)
      ? mb.total
      : rentalSubtotal + cleaningFeesTotal + resaleSubtotal;

  const sumWithStatedService =
    merchandiseTotal +
    collateralSum +
    orderDeliveryFee +
    orderServiceFee +
    orderVatAmount;
  let serviceFeeDisplay = orderServiceFee;
  if (Math.abs(orderTotalAmount - sumWithStatedService) > 1) {
    serviceFeeDisplay = Math.max(
      0,
      orderTotalAmount -
        merchandiseTotal -
        collateralSum -
        orderDeliveryFee -
        orderVatAmount,
    );
  }
  const sumFinal =
    merchandiseTotal +
    collateralSum +
    orderDeliveryFee +
    serviceFeeDisplay +
    orderVatAmount;
  const otherAdjust = orderTotalAmount - sumFinal;
  const resaleOnlyOrder = isListerResaleOrder(orderData);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="divide-y divide-gray-100">
          {items.map((line, index) => {
            const key =
              line.id != null ? `${String(line.id)}-${index}` : `item-${index}`;
            const start = line.rentalStartDate ?? orderData.rentalStartDate;
            const end = line.rentalEndDate ?? orderData.rentalEndDate;
            const days = Number(line.rentalDays ?? line.days ?? 0);
            const resale = isResaleLine(line);
            const periodLabel = formatShortRange(start, end);
            const returnLabel = formatReturnDue(line.returnDueDate ?? null, end ?? null);

            return (
              <div key={key} className="flex gap-3 p-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {line.imageUrl ? (
                    <img
                      src={cloudinaryOptimizedImageUrl(line.imageUrl, {
                        preset: "thumb",
                      })}
                      alt={line.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <Package className="h-6 w-6" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {line.name || "Item"}
                  </Paragraph1>
                  <Paragraph1 className="mt-0.5 text-xs text-gray-600">
                    {resale
                      ? "Purchase"
                      : `Qty ${line.quantity ?? 1}${days > 0 ? ` · ${days} day${days === 1 ? "" : "s"}` : ""}`}
                    {periodLabel ? ` · ${periodLabel}` : ""}
                  </Paragraph1>
                  {!resale && returnLabel ? (
                    <Paragraph1 className="mt-0.5 text-xs font-medium text-gray-800">
                      Return by {returnLabel}
                    </Paragraph1>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-3 py-2.5">
          <Paragraph1 className="text-sm font-semibold text-gray-900">Total paid</Paragraph1>
          <Paragraph1 className="text-sm font-bold tabular-nums text-gray-900">
            {CURRENCY}
            {formatCurrency(orderTotalAmount)}
          </Paragraph1>
        </div>

        <div className="flex items-center gap-2.5 border-t border-gray-100 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {listerAvatar ? (
              <img
                src={cloudinaryOptimizedImageUrl(listerAvatar, {
                  preset: "thumb",
                })}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold text-gray-600">
                {listerName.charAt(0) || "L"}
              </span>
            )}
          </div>
          <Paragraph1 className="truncate text-sm font-medium text-gray-900">
            {listerName}
          </Paragraph1>
        </div>
      </div>

      <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-3 text-sm font-semibold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
          Payment breakdown
          <ChevronDown
            size={16}
            className="shrink-0 text-gray-400 transition group-open:rotate-180"
          />
        </summary>
        <div className="space-y-2 border-t border-gray-100 px-3.5 pb-3.5 pt-2 text-sm">
          {!resaleOnlyOrder && rentalSubtotal > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Rental</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(rentalSubtotal)}
              </span>
            </div>
          ) : null}
          {cleaningFeesTotal > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Cleaning</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(cleaningFeesTotal)}
              </span>
            </div>
          ) : null}
          {resaleSubtotal > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>{resaleOnlyOrder ? "Purchase" : "Resale items"}</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(resaleSubtotal)}
              </span>
            </div>
          ) : null}
          {rentalSubtotal <= 0 &&
          cleaningFeesTotal <= 0 &&
          resaleSubtotal <= 0 &&
          merchandiseTotal > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Merchandise</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(merchandiseTotal)}
              </span>
            </div>
          ) : null}
          {collateralSum > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Collateral (escrow)</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(collateralSum)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-gray-600">
            <span>{resaleOnlyOrder ? "Delivery" : "Delivery & return"}</span>
            <span className="font-semibold tabular-nums text-gray-900">
              {CURRENCY}
              {formatCurrency(orderDeliveryFee)}
            </span>
          </div>
          {orderVatAmount > 0 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>VAT</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(orderVatAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-gray-600">
            <span>Service fee</span>
            <span className="font-semibold tabular-nums text-gray-900">
              {CURRENCY}
              {formatCurrency(serviceFeeDisplay)}
            </span>
          </div>
          {Math.abs(otherAdjust) > 1 ? (
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Adjustments</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {CURRENCY}
                {formatCurrency(otherAdjust)}
              </span>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}
