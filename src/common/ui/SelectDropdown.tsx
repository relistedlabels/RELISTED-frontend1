"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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

const MENU_MAX_HEIGHT = 280;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;
const MENU_Z_INDEX = 250;

type MenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

function computeMenuPosition(
  triggerRect: DOMRect,
  optionCount: number,
  preferMenuAbove: boolean,
  triggerIcon?: ReactNode,
): { above: boolean; style: MenuPosition } {
  const estimatedMenuHeight = Math.min(optionCount * 44 + 8, MENU_MAX_HEIGHT);
  const spaceBelow =
    window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING;

  let above = preferMenuAbove;
  if (!preferMenuAbove) {
    above =
      spaceBelow < estimatedMenuHeight + MENU_GAP && spaceAbove > spaceBelow;
  }

  const available = above ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(
    132,
    Math.min(MENU_MAX_HEIGHT, available - MENU_GAP),
  );

  const width = triggerIcon
    ? Math.max(192, triggerRect.width)
    : triggerRect.width;
  let left = triggerIcon ? triggerRect.right - width : triggerRect.left;
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING),
  );

  if (above) {
    return {
      above: true,
      style: {
        left,
        width,
        bottom: window.innerHeight - triggerRect.top + MENU_GAP,
        maxHeight,
      },
    };
  }

  return {
    above: false,
    style: {
      left,
      width,
      top: triggerRect.bottom + MENU_GAP,
      maxHeight,
    },
  };
}

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
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  const updateMenuPosition = useCallback(() => {
    if (!open || !triggerRef.current) return;

    const result = computeMenuPosition(
      triggerRef.current.getBoundingClientRect(),
      options.length,
      preferMenuAbove,
      triggerIcon,
    );
    setMenuStyle({
      position: "fixed",
      zIndex: MENU_Z_INDEX,
      left: result.style.left,
      width: result.style.width,
      maxHeight: result.style.maxHeight,
      ...(result.style.top != null ? { top: result.style.top } : {}),
      ...(result.style.bottom != null ? { bottom: result.style.bottom } : {}),
    });
  }, [open, options.length, preferMenuAbove, triggerIcon]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    updateMenuPosition();
  }, [updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-select-dropdown-menu]")
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const menu =
    open && options.length > 0 ? (
      <ul
        role="listbox"
        aria-label={ariaLabel}
        data-select-dropdown-menu
        style={menuStyle}
        className={`overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white shadow-lg ${
          triggerIcon ? "min-w-48" : ""
        }`}
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
                  isSelected
                    ? "bg-gray-50 font-semibold text-gray-900"
                    : "font-medium text-gray-700"
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
    ) : null;

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

      {mounted && menu ? createPortal(menu, document.body) : null}

      {options.length === 0 ? (
        <Paragraph1 className="mt-2 text-gray-500 text-xs">{emptyMessage}</Paragraph1>
      ) : null}
    </div>
  );
}
