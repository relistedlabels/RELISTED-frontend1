"use client";

import { useEffect, useRef, useState } from "react";
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
};

export default function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  ariaLabel,
  disabled = false,
  emptyMessage = "No options available",
  className = "",
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

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
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-3 py-3 text-left text-sm transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && options.length > 0 ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-[130] mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
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
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                    isSelected ? "bg-gray-50 font-medium text-gray-900" : "text-gray-800"
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
