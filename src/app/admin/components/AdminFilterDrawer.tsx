"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function AdminFilterButton({
  onClick,
  activeCount,
}: {
  onClick: () => void;
  activeCount: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
      }
      className="relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:px-4"
    >
      <SlidersHorizontal size={16} aria-hidden />
      <span>Filters</span>
      {activeCount > 0 ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
          {activeCount}
        </span>
      ) : null}
    </button>
  );
}

export function AdminFilterDrawer({
  isOpen,
  onClose,
  onClear,
  activeCount,
  title = "Filters",
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  activeCount: number;
  title?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label="Close filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-filter-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="text-gray-500"
                  aria-hidden
                />
                <h2
                  id="admin-filter-drawer-title"
                  className="text-base font-semibold text-gray-900"
                >
                  {title}
                </h2>
                {activeCount > 0 ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {activeCount} active
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={18} aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={onClear}
                disabled={activeCount === 0}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Done
              </button>
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
