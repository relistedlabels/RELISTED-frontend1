"use client";

import { MapPin } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type {
  CheckoutReviewDelivery,
  CheckoutReviewReturn,
} from "@/lib/checkout/checkoutFlow";
import { CheckoutShippingLegHeader } from "./CheckoutDispatchLegPreview";
import CheckoutShipmentBlock from "./CheckoutShipmentBlock";

type CheckoutReviewDeliverySectionProps = {
  review: CheckoutReviewDelivery;
  returnReview?: CheckoutReviewReturn | null;
};

function ReviewAddressBlock({ address }: { address: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <MapPin className="mt-1 size-4 text-gray-400 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <Paragraph1 className="font-medium text-gray-500 text-xs">
          Address
        </Paragraph1>
        <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
          {address}
        </Paragraph1>
      </div>
    </div>
  );
}

export default function CheckoutReviewDeliverySection({
  review,
  returnReview,
}: CheckoutReviewDeliverySectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <CheckoutShippingLegHeader sectionLabel="DELIVERY" leg="outbound" />
        <hr className="my-4 text-gray-100" />

        <div className="space-y-4">
          <ReviewAddressBlock address={review.address} />

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
      </div>

      {returnReview ? (
        <div className="bg-white p-4 border border-gray-100 rounded-xl">
          <CheckoutShippingLegHeader sectionLabel="RETURN" leg="return" />
          <hr className="my-4 text-gray-100" />

          <div className="space-y-4">
            <ReviewAddressBlock address={returnReview.address} />

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
        </div>
      ) : null}
    </div>
  );
}
