"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Mail, Calendar } from "lucide-react";
import { HiOutlineEnvelope, HiOutlineUser } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  readGuestContact,
  saveGuestContact,
} from "@/lib/guest/guestContactStorage";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { dialogBackdrop } from "@/common/ui/dashboardClasses";

type GuestContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { firstName: string; email: string }) => void;
  isSubmitting?: boolean;
};

export default function GuestContactModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: GuestContactModalProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const wasOpenRef = useRef(false);

  // Pre-fill from storage once when the modal opens, not on every render.
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!justOpened) return;

    const saved = readGuestContact();
    setFirstName(saved?.firstName ?? "");
    setEmail(saved?.email ?? "");
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const firstNameValue = String(
      new FormData(form).get("firstName") ?? "",
    ).trim();
    const emailValue = String(new FormData(form).get("email") ?? "").trim();

    if (!firstNameValue || !emailValue) return;

    const contact = { firstName: firstNameValue, email: emailValue };
    saveGuestContact(contact);
    onSubmit(contact);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${dialogBackdrop} z-[110] items-end sm:items-center p-0 sm:p-4`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-contact-title"
            className="relative bg-white shadow-2xl px-6 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10 sm:rounded-3xl rounded-t-3xl w-full max-w-md"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="top-4 right-4 absolute hover:bg-gray-100 p-2 rounded-full text-gray-500 hover:text-black transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-8 text-center">
              <img
                src="/images/logo1.svg"
                alt="Relisted"
                className="mb-5 w-10 h-10"
              />
              <div id="guest-contact-title">
                <Paragraph3 className="mb-2 font-bold text-black text-2xl">
                  Almost there
                </Paragraph3>
              </div>
              <Paragraph1 className="max-w-[320px] text-gray-600 text-sm leading-relaxed">
                We will notify you when the lister confirms. No sign up needed.
              </Paragraph1>
            </div>

            <div className="space-y-5">
              <div>
                <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
                  First name
                </Paragraph1>
                <div className="relative">
                  <HiOutlineUser className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="py-3.5 pr-4 pl-12 border border-gray-300 focus:border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
                  Email address
                </Paragraph1>
                <div className="relative">
                  <HiOutlineEnvelope className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="py-3.5 pr-4 pl-12 border border-gray-300 focus:border-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonPrimaryFull} mt-8 gap-2 py-4 rounded-xl active:scale-[0.99] disabled:opacity-60`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" aria-hidden />
                  Check Availability{" "}
                </>
              )}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
