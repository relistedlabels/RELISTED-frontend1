"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Clock, Truck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type { CheckoutReviewDeliveryShipment } from "@/lib/checkout/checkoutFlow";
import { resolveCheckoutDisplayLine } from "@/lib/checkout/checkoutLineDisplay";

type CheckoutShipmentBlockProps = {
  shipment: CheckoutReviewDeliveryShipment;
  showDivider?: boolean;
  /** Step 4 review: show selected carrier row. Step 2 uses carrier pickers as children. */
  showSelectedCarrier?: boolean;
  children?: ReactNode;
};

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("en-NG");

export default function CheckoutShipmentBlock({
  shipment,
  showDivider = false,
  showSelectedCarrier = false,
  children,
}: CheckoutShipmentBlockProps) {
  return (
    <div
      className={
        showDivider
          ? "pt-4 border-gray-100 border-t space-y-3"
          : "space-y-3"
      }
    >
      {shipment.heading ? (
        <Paragraph1 className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
          {shipment.heading}
        </Paragraph1>
      ) : null}

      {shipment.items.length > 0 ? (
        <ul className="space-y-2.5">
          {shipment.items.map((item) => {
            const line = resolveCheckoutDisplayLine(item);
            return (
              <li
                key={line.rowKey}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-100">
                  {line.productImageUrl ? (
                    <Image
                      src={line.productImageUrl}
                      alt={line.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Paragraph1 className="truncate font-medium text-gray-900 text-sm leading-snug">
                    {line.productName}
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-xs leading-snug">
                    {line.subtitle}
                  </Paragraph1>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {shipment.deliveryWindow ? (
        <div className="flex items-start gap-3.5">
          <Clock
            className="mt-1 size-4 text-gray-400 shrink-0"
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <Paragraph1 className="font-medium text-gray-500 text-xs">
              Delivery window
            </Paragraph1>
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {shipment.deliveryWindow}
            </Paragraph1>
          </div>
        </div>
      ) : null}

      {shipment.pickupWindow ? (
        <div className="flex items-start gap-3.5">
          <Clock
            className="mt-1 size-4 text-gray-400 shrink-0"
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <Paragraph1 className="font-medium text-gray-500 text-xs">
              Pickup window
            </Paragraph1>
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {shipment.pickupWindow}
            </Paragraph1>
          </div>
        </div>
      ) : null}

      {children}

      {showSelectedCarrier && shipment.shipping ? (
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <Truck
              className="mt-1 size-4 text-gray-400 shrink-0"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <Paragraph1 className="font-medium text-gray-500 text-xs">
                Carrier
              </Paragraph1>
              <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
                {shipment.shipping.method}
              </Paragraph1>
            </div>
          </div>
          {shipment.shipping.cost !== undefined ? (
            <Paragraph1 className="font-semibold text-gray-900 text-[15px] shrink-0 tabular-nums">
              ₦{formatCurrency(shipment.shipping.cost)}
            </Paragraph1>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
