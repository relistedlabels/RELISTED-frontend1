"use client";

import { ChevronRight, PencilLine } from "lucide-react";
import { CheckoutFieldLabel } from "./CheckoutFieldLabel";

type CheckoutEditableFieldProps = {
  label: string;
  value?: string;
  placeholder: string;
  empty?: boolean;
  /** Saved value exists but needs correction before checkout can continue. */
  invalid?: boolean;
  helperText?: string;
  onClick: () => void;
  ariaLabel: string;
  /** When true, sits inside a grouped card (no outer border/radius). */
  grouped?: boolean;
};

export default function CheckoutEditableField({
  label,
  value,
  placeholder,
  empty = false,
  invalid = false,
  helperText,
  onClick,
  ariaLabel,
  grouped = false,
}: CheckoutEditableFieldProps) {
  const displayValue = value?.trim() || placeholder;
  const isEmpty = empty || !value?.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group flex w-full items-center gap-3 text-left transition-colors ${
        grouped
          ? `px-3 py-2.5 ${
              invalid
                ? "bg-amber-50/80 hover:bg-amber-50"
                : "hover:bg-gray-50"
            }`
          : `rounded-lg border px-3 py-2.5 ${
              invalid
                ? "border-amber-300 bg-amber-50/80 hover:border-amber-400 hover:bg-amber-50"
                : isEmpty
                  ? "border-dashed border-gray-300 bg-gray-50/60 hover:border-gray-400 hover:bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-900/25 hover:bg-gray-50/80"
            }`
      }`}
    >
      <div className="min-w-0 flex-1">
        <CheckoutFieldLabel>{label}</CheckoutFieldLabel>
        <p
          className={`mt-0.5 text-sm leading-snug ${
            isEmpty ? "text-gray-500" : "font-medium text-gray-900"
          }`}
        >
          {displayValue}
        </p>
        {invalid && helperText ? (
          <p className="mt-1 text-amber-800 text-xs leading-snug">
            {helperText}
          </p>
        ) : null}
      </div>
      <span className="flex shrink-0 items-center gap-1 text-gray-400 transition-colors group-hover:text-gray-900">
        <PencilLine size={14} aria-hidden />
        <ChevronRight size={16} className="-mr-0.5" aria-hidden />
      </span>
    </button>
  );
}
