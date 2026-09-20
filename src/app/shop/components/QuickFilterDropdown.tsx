"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type QuickFilterOption = {
  value: string;
  label: string;
};

type QuickFilterDropdownProps = {
  label: string;
  options: QuickFilterOption[];
  selected: string[];
  onToggle: (value: string, checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  emptyMessage?: string;
};

const MENU_MAX_HEIGHT = 280;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;
const MENU_Z_INDEX = 250;

function computeMenuPosition(triggerRect: DOMRect, optionCount: number) {
  const estimatedMenuHeight = Math.min(optionCount * 40 + 8, MENU_MAX_HEIGHT);
  const spaceBelow =
    window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
  const above =
    spaceBelow < estimatedMenuHeight + MENU_GAP && spaceAbove > spaceBelow;
  const available = above ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(
    132,
    Math.min(MENU_MAX_HEIGHT, available - MENU_GAP),
  );
  const width = Math.max(176, triggerRect.width);
  let left = triggerRect.left;
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING),
  );

  if (above) {
    return {
      style: {
        left,
        width,
        bottom: window.innerHeight - triggerRect.top + MENU_GAP,
        maxHeight,
      } as CSSProperties,
    };
  }

  return {
    style: {
      left,
      width,
      top: triggerRect.bottom + MENU_GAP,
      maxHeight,
    } as CSSProperties,
  };
}

export default function QuickFilterDropdown({
  label,
  options,
  selected,
  onToggle,
  ariaLabel,
  disabled = false,
  emptyMessage = "No options available",
}: QuickFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive = selected.length > 0;

  const updateMenuPosition = useCallback(() => {
    if (!open || !triggerRef.current) return;
    const result = computeMenuPosition(
      triggerRef.current.getBoundingClientRect(),
      Math.max(options.length, 1),
    );
    setMenuStyle({
      position: "fixed",
      zIndex: MENU_Z_INDEX,
      ...result.style,
    });
  }, [open, options.length]);

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
        target.closest("[data-quick-filter-menu]")
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const menu =
    open && mounted ? (
      <ul
        role="listbox"
        aria-label={ariaLabel ?? label}
        aria-multiselectable="true"
        data-quick-filter-menu
        style={menuStyle}
        className="overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
      >
        {options.length === 0 ? (
          <li className="px-3.5 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
        ) : (
          options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <li key={option.value} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      onToggle(option.value, event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className={checked ? "font-semibold text-gray-900" : ""}>
                    {option.label}
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap text-sm leading-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? "font-semibold text-black"
            : "font-medium text-gray-800 hover:text-black"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
