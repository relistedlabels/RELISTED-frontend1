"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Paragraph1 } from "@/common/ui/Text";
import { SHOP_SORT_OPTIONS, type ShopSortValue } from "@/lib/shop/shopBrowse";

const variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};

type SortPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  currentSort: ShopSortValue;
};

export default function SortPanel({ isOpen, onClose, currentSort }: SortPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: ShopSortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}#shop-all-listings` : `/shop#shop-all-listings`);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="fixed inset-y-0 right-0 flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:w-[28.5rem]"
          role="dialog"
          aria-modal="true"
          aria-label="Sort products"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 pb-4 pt-6 sm:px-5">
            <Paragraph1 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              Sort by
            </Paragraph1>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              aria-label="Close sort panel"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5 sm:px-5">
            {SHOP_SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-2 py-3 text-sm text-left transition ${
                  currentSort === option.value
                    ? "text-black font-semibold"
                    : "text-gray-700 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Paragraph1>{option.label}</Paragraph1>
                {currentSort === option.value ? (
                  <Check className="ml-2 h-5 w-5 shrink-0 text-black" aria-hidden />
                ) : null}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}