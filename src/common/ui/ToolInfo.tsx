"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

type Placement = "top" | "bottom" | "left" | "right";

interface ToolInfoProps {
  content: React.ReactNode;
  className?: string;
}

export function ToolInfo({ content, className }: ToolInfoProps) {
  const iconRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<Placement>("top");
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open || !iconRef.current || !tooltipRef.current) return;

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    const space = {
      top: iconRect.top,
      bottom: window.innerHeight - iconRect.bottom,
      left: iconRect.left,
      right: window.innerWidth - iconRect.right,
    };

    let nextPlacement: Placement = "top";
    if (space.bottom >= tooltipRect.height) nextPlacement = "bottom";
    else if (space.top >= tooltipRect.height) nextPlacement = "top";
    else if (space.right >= tooltipRect.width) nextPlacement = "right";
    else if (space.left >= tooltipRect.width) nextPlacement = "left";

    let top = 0;
    let left = 0;

    switch (nextPlacement) {
      case "bottom":
        top = iconRect.bottom + padding;
        left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        break;
      case "top":
        top = iconRect.top - tooltipRect.height - padding;
        left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        break;
      case "right":
        top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
        left = iconRect.right + padding;
        break;
      case "left":
        top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
        left = iconRect.left - tooltipRect.width - padding;
        break;
    }

    setPlacement(nextPlacement);
    setCoords({
      top: Math.max(
        8,
        Math.min(top, window.innerHeight - tooltipRect.height - 8),
      ),
      left: Math.max(
        8,
        Math.min(left, window.innerWidth - tooltipRect.width - 8),
      ),
    });
  }, [open]);

  return (
    <>
      <span
        ref={iconRef}
        className={`inline-flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 ${className ?? ""}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info size={14} />
      </span>

      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 50,
            }}
            className="max-w-[200px] rounded-lg bg-black px-3 py-2 text-xs text-white shadow-lg"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
