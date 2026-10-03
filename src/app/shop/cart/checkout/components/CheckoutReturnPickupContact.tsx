"use client";

import { useState } from "react";
import type { ReturnPickupAddressPayload } from "@/lib/api/cart";
import { formatReturnPickupAddressLine } from "@/lib/checkout/deliveryAddress";
import { profilePhoneNeedsUpdate } from "@/lib/checkout/profilePhone";
import CheckoutEditableField from "./CheckoutEditableField";
import { ChangeReturnPickupPanel } from "./ChangeReturnPickup";

type CheckoutReturnPickupContactProps = {
  returnPickupAddress?: ReturnPickupAddressPayload;
  deliveryDefaults: ReturnPickupAddressPayload;
  onReturnPickupChange?: (value?: ReturnPickupAddressPayload) => void;
};

export default function CheckoutReturnPickupContact({
  returnPickupAddress,
  deliveryDefaults,
  onReturnPickupChange,
}: CheckoutReturnPickupContactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const value = returnPickupAddress ?? deliveryDefaults;
  const addressLine = formatReturnPickupAddressLine(value);
  const openPanel = () => setIsOpen(true);

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white">
        <CheckoutEditableField
          label="Name"
          value={value.contactName}
          placeholder="Add contact name"
          empty={!value.contactName?.trim()}
          grouped
          onClick={openPanel}
          ariaLabel="Edit return pickup contact name"
        />
        <CheckoutEditableField
          label="Address"
          value={addressLine ?? undefined}
          placeholder="Add pickup address"
          empty={!addressLine}
          grouped
          onClick={openPanel}
          ariaLabel="Edit return pickup address"
        />
        <CheckoutEditableField
          label="Phone"
          value={value.phoneNumber}
          placeholder="Add phone number"
          empty={!value.phoneNumber?.trim()}
          invalid={profilePhoneNeedsUpdate(value.phoneNumber)}
          helperText={
            profilePhoneNeedsUpdate(value.phoneNumber)
              ? "Update this number to continue to payment."
              : undefined
          }
          grouped
          onClick={openPanel}
          ariaLabel={
            profilePhoneNeedsUpdate(value.phoneNumber)
              ? "Update return pickup phone number"
              : "Edit return pickup phone number"
          }
        />
      </div>

      <ChangeReturnPickupPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialValue={value}
        deliveryDefaults={deliveryDefaults}
        onSave={(next) => onReturnPickupChange?.(next)}
      />
    </>
  );
}
