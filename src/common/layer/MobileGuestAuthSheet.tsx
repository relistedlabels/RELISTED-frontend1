"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimaryFull, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  bottomSheetBackdrop,
  bottomSheetPanel,
} from "@/common/ui/dashboardClasses";

type MobileGuestAuthSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileGuestAuthSheet({
  isOpen,
  onClose,
}: MobileGuestAuthSheetProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const redirectUrl = qs ? `${pathname}?${qs}` : pathname;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${bottomSheetBackdrop} z-[120]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-auth-sheet-title"
            className={`${bottomSheetPanel} px-6 pt-8`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-black transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <img
                src="/images/logo1.svg"
                alt="Relisted"
                className="mx-auto mb-4 h-10 w-10"
              />
              <Paragraph3
                className="mb-2 font-bold text-black text-xl"
              >
                <span id="guest-auth-sheet-title">Sign in to your account</span>
              </Paragraph3>
              <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
                Track orders, manage rentals, and checkout faster.
              </Paragraph1>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}`}
                onClick={onClose}
                className={`${buttonPrimaryFull} rounded-xl py-3.5 text-center`}
              >
                Sign in
              </Link>
              <Link
                href={`/auth/create-account?redirect=${encodeURIComponent(redirectUrl)}`}
                onClick={onClose}
                className={`${buttonSecondary} w-full rounded-xl py-3.5 text-center`}
              >
                Create account
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
              >
                Continue browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
