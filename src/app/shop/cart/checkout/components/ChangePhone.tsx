"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import {
  slidePanelBackdrop,
  slidePanelBody,
  slidePanelHeader,
  slidePanelSheetPinned,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { PhoneInput } from "@/app/auth/profile-setup/components/PhoneInput";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useUpdateProfile } from "@/lib/mutations/user/useUpdateProfile";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import {
  profileHasPhone,
  resolveProfilePhone,
} from "@/lib/checkout/profilePhone";
import { validatePhoneNumber } from "@/lib/phone";
import { toast } from "sonner";
import CheckoutEditableField from "./CheckoutEditableField";

interface ChangePhonePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPhoneSaved?: () => void;
  panelTitle?: string;
}

const ChangePhonePanel: React.FC<ChangePhonePanelProps> = ({
  isOpen,
  onClose,
  onPhoneSaved,
  panelTitle = "Update phone number",
}) => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const resolved = resolveProfilePhone(profile);
    if (!resolved) return;
    setPhoneNumber(resolved);
  }, [profile]);

  useEffect(() => {
    if (!updateProfile.isSuccess) return;
    onPhoneSaved?.();
    onClose();
  }, [updateProfile.isSuccess, onClose, onPhoneSaved]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    updateProfile.mutate({ phoneNumber: phoneNumber.trim() });
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
            className={slidePanelSheetPinned}
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
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
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close phone modal"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>{panelTitle}</Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close phone modal"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            <div
              className={`${slidePanelBody} pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]`}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                <button
                  type="submit"
                  disabled={
                    !profileHasPhone(phoneNumber) || updateProfile.isPending
                  }
                  className={`${buttonPrimaryFull} disabled:opacity-50`}
                >
                  {updateProfile.isPending ? "Saving..." : "Save phone number"}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

interface ChangePhoneProps {
  onPhoneSaved?: () => void;
  buttonLabel?: string;
  panelTitle?: string;
  variant?: "link" | "outline" | "row" | "field";
  phoneLine?: string;
  fieldLabel?: string;
  grouped?: boolean;
}

const ChangePhone: React.FC<ChangePhoneProps> = ({
  onPhoneSaved,
  buttonLabel = "Change",
  panelTitle = "Update phone number",
  variant = "link",
  phoneLine,
  fieldLabel = "Phone",
  grouped = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = () => setIsOpen(true);

  const triggerClassName =
    variant === "link"
      ? "shrink-0 whitespace-nowrap text-sm font-semibold text-gray-900 underline-offset-4 hover:underline transition-colors"
      : "shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors";

  return (
    <>
      {variant === "field" ? (
        <CheckoutEditableField
          label={fieldLabel}
          value={phoneLine}
          placeholder="Add phone number"
          empty={!phoneLine?.trim()}
          grouped={grouped}
          onClick={openPanel}
          ariaLabel={
            phoneLine?.trim() ? "Edit phone number" : "Add phone number"
          }
        />
      ) : variant === "row" && phoneLine ? (
        <button
          type="button"
          onClick={openPanel}
          aria-label={`${buttonLabel} phone number`}
          className="flex w-full items-start gap-3.5 bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-xl text-left transition-colors"
        >
          <Phone
            size={20}
            className="mt-1 text-gray-500 shrink-0"
            aria-hidden
          />
          <div className="flex flex-1 justify-between items-start gap-4 min-w-0">
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {phoneLine}
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

      <ChangePhonePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPhoneSaved={onPhoneSaved}
        panelTitle={panelTitle}
      />
    </>
  );
};

export default ChangePhone;
