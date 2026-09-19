"use client";

import { MapPin } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type {
  CheckoutReviewDelivery,
  CheckoutReviewReturn,
} from "@/lib/checkout/checkoutFlow";
import CheckoutSectionHeading from "./CheckoutSectionHeading";
import CheckoutShipmentBlock from "./CheckoutShipmentBlock";

type CheckoutReviewDeliverySectionProps = {
  review: CheckoutReviewDelivery;
  returnReview?: CheckoutReviewReturn | null;
};

export default function CheckoutReviewDeliverySection({
  review,
  returnReview,
}: CheckoutReviewDeliverySectionProps) {
  return (
    <div className="space-y-4 bg-white p-5 border border-gray-100 rounded-xl">
      <CheckoutSectionHeading>Order details</CheckoutSectionHeading>

      <div className="space-y-4 bg-gray-50 p-4 sm:p-5 border border-gray-100 rounded-xl">
        <h4 className="font-semibold text-gray-900 text-[15px] leading-snug">
          Delivery to you
        </h4>

        <div className="flex items-start gap-3.5">
          <MapPin
            className="mt-1 size-4 text-gray-400 shrink-0"
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <Paragraph1 className="font-medium text-gray-500 text-xs">
              Address
            </Paragraph1>
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {review.address}
            </Paragraph1>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-gray-200 border-t">
          {review.shipments.map((shipment, index) => (
            <CheckoutShipmentBlock
              key={shipment.bucketIndex ?? `delivery-${index}`}
              shipment={shipment}
              showDivider={index > 0}
              showSelectedCarrier
            />
          ))}
        </div>
      </div>

      {returnReview ? (
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 border border-gray-100 rounded-xl">
          <h4 className="font-semibold text-gray-900 text-[15px] leading-snug">
            Return from you
          </h4>

          <div className="flex items-start gap-3.5">
            <MapPin
              className="mt-1 size-4 text-gray-400 shrink-0"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <Paragraph1 className="font-medium text-gray-500 text-xs">
                Address
              </Paragraph1>
              <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
                {returnReview.address}
              </Paragraph1>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-gray-200 border-t">
            {returnReview.shipments.map((shipment, index) => (
              <CheckoutShipmentBlock
                key={shipment.bucketIndex ?? `return-${index}`}
                shipment={shipment}
                showDivider={index > 0}
                showSelectedCarrier
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
