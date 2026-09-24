"use client";

import ChangeAddress from "./ChangeAddress";
import ChangePhone from "./ChangePhone";
import { CheckoutFieldLabel } from "./CheckoutFieldLabel";

type CheckoutDeliveryContactProps = {
  contactName?: string;
  deliveryAddress: string;
  phoneLine?: string;
  onContactSaved?: () => void;
};

export default function CheckoutDeliveryContact({
  contactName,
  deliveryAddress,
  phoneLine,
  onContactSaved,
}: CheckoutDeliveryContactProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white">
      {contactName?.trim() ? (
        <div className="px-3 py-2.5">
          <CheckoutFieldLabel>Name</CheckoutFieldLabel>
          <p className="mt-0.5 font-medium text-gray-900 text-sm leading-snug">
            {contactName.trim()}
          </p>
        </div>
      ) : null}

      <ChangeAddress
        variant="field"
        grouped
        addressLine={deliveryAddress}
        onAddressSaved={onContactSaved}
      />
      <ChangePhone
        variant="field"
        grouped
        phoneLine={phoneLine}
        onPhoneSaved={onContactSaved}
      />
    </div>
  );
}

type CheckoutDeliveryContactEmptyProps = {
  onContactSaved?: () => void;
};

export function CheckoutDeliveryContactEmpty({
  onContactSaved,
}: CheckoutDeliveryContactEmptyProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ChangeAddress
        variant="field"
        grouped
        panelTitle="Add delivery address"
        onAddressSaved={onContactSaved}
      />
    </div>
  );
}
