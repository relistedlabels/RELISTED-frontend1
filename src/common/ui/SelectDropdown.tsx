"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

export type SelectDropdownOption = {
  value: string;
  label: string;
};

type SelectDropdownProps = {
  value: string;
  options: SelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Prefer opening the menu above the trigger (useful inside bottom sheets). */
  preferMenuAbove?: boolean;
  /** Shorter control for dense toolbars (matches h-11 shop inputs). */
  compact?: boolean;
  triggerClassName?: string;
  /** Icon-only trigger; label stays available to screen readers. */
  triggerIcon?: ReactNode;
};

const MENU_MAX_HEIGHT = 192;

export default function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  ariaLabel,
  disabled = false,
  emptyMessage = "No options available",
  className = "",
  preferMenuAbove = false,
  compact = false,
  triggerClassName = "",
  triggerIcon,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuAbove, setMenuAbove] = useState(preferMenuAbove);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(
      options.length * 44 + 8,
      MENU_MAX_HEIGHT,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (preferMenuAbove) {
      setMenuAbove(true);
      return;
    }

    setMenuAbove(
      spaceBelow < estimatedMenuHeight + 12 && spaceAbove > spaceBelow,
    );
  }, [open, options.length, preferMenuAbove]);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center rounded-xl border border-gray-300 bg-white text-left font-medium transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60 ${
          triggerIcon
            ? "justify-center px-0"
            : "justify-between gap-2 px-3"
        } ${compact ? "h-11 text-sm" : "py-3 text-base"} ${triggerClassName}`}
      >
        {triggerIcon ? (
          <>
            <span className="sr-only">{selected?.label ?? placeholder}</span>
            {triggerIcon}
          </>
        ) : (
          <>
            <span
              className={`block min-w-0 flex-1 truncate leading-none ${
                selected ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </>
        )}
      </button>

      {open && options.length > 0 ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-[130] max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg ${
            triggerIcon ? "right-0 min-w-48 w-max" : "w-full"
          } ${menuAbove ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                    isSelected ? "bg-gray-50 font-semibold text-gray-900" : "font-medium text-gray-700"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <Check size={16} className="shrink-0 text-black" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {options.length === 0 ? (
        <Paragraph1 className="mt-2 text-gray-500 text-xs">{emptyMessage}</Paragraph1>
      ) : null}
    </div>
  );
}
