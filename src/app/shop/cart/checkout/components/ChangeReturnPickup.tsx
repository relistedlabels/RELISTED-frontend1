"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import {
  slidePanelBackdrop,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import {
  canonicalReturnPickupJson,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";

const TOPSHIP_CITIES = [
  "Abule Egba",
  "Agege",
  "Ajah",
  "Amuwo Odofin",
  "Apapa",
  "Badagry",
  "Bariga",
  "Ebute Metta",
  "Egbeda",
  "Epe",
  "Ibeju-Lekki",
  "Igando",
  "Igbogbo",
  "Ijegun",
  "Ikeja",
  "Ikorodu",
  "Ikotun",
  "Ikoyi",
  "Ipaja",
  "Isolo",
  "Iyana Ipaja",
  "Kosofe",
  "Lagos",
  "Lagos Island",
  "Lekki",
  "Marina",
  "Maryland",
  "Mushin",
  "Ogba",
  "Ojo",
  "Ojokoro Ijaiye",
  "Onikan",
  "Oshodi",
  "Sangotedo",
  "Somolu",
  "Surulere",
  "Victoria Island",
  "Yaba",
];

function pickupValidationErrors(
  form: ReturnPickupAddressPayload,
): string[] {
  const required: Array<{
    field: keyof ReturnPickupAddressPayload;
    label: string;
  }> = [
    { field: "contactName", label: "Contact name" },
    { field: "phoneNumber", label: "Phone number" },
    { field: "street", label: "Street" },
    { field: "city", label: "City" },
  ];
  return required
    .filter(({ field }) => !form[field]?.trim())
    .map(({ label }) => `${label} is required`);
}

interface ChangeReturnPickupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: ReturnPickupAddressPayload;
  deliveryDefaults: ReturnPickupAddressPayload;
  onSave: (value?: ReturnPickupAddressPayload) => void;
}

function ChangeReturnPickupPanel({
  isOpen,
  onClose,
  initialValue,
  deliveryDefaults,
  onSave,
}: ChangeReturnPickupPanelProps) {
  const [form, setForm] = useState<ReturnPickupAddressPayload>(initialValue);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialValue);
      setShowErrors(false);
    }
  }, [isOpen, initialValue]);

  const errors = useMemo(() => pickupValidationErrors(form), [form]);

  const handleFieldChange = (
    field: keyof ReturnPickupAddressPayload,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseDeliveryAddress = () => {
    onSave(undefined);
    onClose();
    toast.success("Pickup set to delivery address");
  };

  const handleSubmit = () => {
    setShowErrors(true);
    if (errors.length > 0) return;

    const matchesDelivery =
      canonicalReturnPickupJson(form) ===
      canonicalReturnPickupJson(deliveryDefaults);

    onSave(matchesDelivery ? undefined : form);
    setSaving(true);
    toast.success("Pickup address saved");
    window.setTimeout(() => {
      setSaving(false);
      onClose();
    }, 300);
  };

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
            role="dialog"
            aria-modal="true"
            aria-label="Update pickup address"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={slidePanelHeader}>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 transition hover:text-black xl:hidden"
                aria-label="Close pickup address"
              >
                <ArrowLeft size={20} />
              </button>
              <Paragraph1 className={slidePanelTitle}>
                Update pickup address
              </Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 transition hover:text-black"
                aria-label="Close pickup address"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            <div className="grow space-y-4 pt-4 pb-20">
              <button
                type="button"
                onClick={handleUseDeliveryAddress}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Use delivery address
              </button>

              <div className="gap-3 grid sm:grid-cols-2">
                <label className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                  Contact name
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) =>
                      handleFieldChange("contactName", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="e.g. Adaora N."
                  />
                </label>
                <label className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                  Phone number
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      handleFieldChange("phoneNumber", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="0801..."
                  />
                </label>
                <label className="sm:col-span-2 font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                  Street
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) =>
                      handleFieldChange("street", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                    placeholder="Apartment, street, landmark"
                  />
                </label>
                <label className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                  City
                  <div className="relative">
                    <select
                      value={form.city}
                      onChange={(e) => {
                        handleFieldChange("city", e.target.value);
                        handleFieldChange("state", "Lagos");
                      }}
                      className="mt-1 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                    >
                      <option value="">Select city</option>
                      {TOPSHIP_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden
                    />
                  </div>
                </label>
                <label className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                  State
                  <input
                    type="text"
                    value="Lagos"
                    disabled
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                  />
                </label>
              </div>

              <label className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
                Handoff notes (optional)
                <textarea
                  value={form.instructions ?? ""}
                  onChange={(e) =>
                    handleFieldChange("instructions", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                  rows={3}
                  placeholder="Gate codes, concierge numbers, etc."
                />
              </label>

              {showErrors && errors.length > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-xs">
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className={`${buttonPrimaryFull} gap-2 py-3.5`}
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                {saving ? "Saving..." : "Save pickup address"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface ChangeReturnPickupProps {
  returnPickupAddress?: ReturnPickupAddressPayload;
  deliveryDefaults: ReturnPickupAddressPayload;
  onReturnPickupChange?: (value?: ReturnPickupAddressPayload) => void;
  buttonLabel?: string;
  variant?: "link" | "outline" | "row";
  addressLine?: string;
}

export default function ChangeReturnPickup({
  returnPickupAddress,
  deliveryDefaults,
  onReturnPickupChange,
  buttonLabel = "Change",
  variant = "link",
  addressLine,
}: ChangeReturnPickupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initialValue = returnPickupAddress ?? deliveryDefaults;
  const openPanel = () => setIsOpen(true);

  const triggerClassName =
    variant === "link"
      ? "shrink-0 whitespace-nowrap text-sm font-semibold text-gray-900 underline-offset-4 hover:underline transition-colors"
      : "shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50";

  return (
    <>
      {variant === "row" && addressLine ? (
        <button
          type="button"
          onClick={openPanel}
          aria-label={`${buttonLabel} pickup address`}
          className="flex w-full items-start gap-3.5 bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-xl text-left transition-colors"
        >
          <MapPin
            size={20}
            className="mt-1 text-gray-500 shrink-0"
            aria-hidden
          />
          <div className="flex flex-1 justify-between items-start gap-4 min-w-0">
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {addressLine}
            </Paragraph1>
            <span className="shrink-0 font-semibold text-gray-900 text-[15px] underline-offset-4">
              {buttonLabel}
            </span>
          </div>
        </button>
      ) : (
        <button type="button" onClick={openPanel} className={triggerClassName}>
          {buttonLabel}
        </button>
      )}

      <ChangeReturnPickupPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialValue={initialValue}
        deliveryDefaults={deliveryDefaults}
        onSave={(value) => onReturnPickupChange?.(value)}
      />
    </>
  );
}
