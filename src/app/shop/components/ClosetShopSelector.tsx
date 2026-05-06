"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { usePublicClosets } from "@/lib/queries/closet/usePublicClosets";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PublicClosetDetail } from "@/lib/api/closet";

function closetThumb(closet: PublicClosetDetail): string | null {
  if (closet.imageUrl?.trim()) return closet.imageUrl.trim();
  if (closet.owner.avatar?.trim()) return closet.owner.avatar.trim();
  return null;
}

function closetLabel(closet: PublicClosetDetail): string {
  return closet.name?.trim() || "Closet";
}

export default function ClosetShopSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const closetIdInUrl = searchParams.get("closetId");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: closets = [], isLoading } = usePublicClosets({ limit: 50 });

  const selected = useMemo(
    () =>
      closetIdInUrl
        ? closets.find((c) => c.id === closetIdInUrl) ?? null
        : null,
    [closetIdInUrl, closets],
  );

  const unknownClosetFilter = Boolean(
    closetIdInUrl && !isLoading && !selected,
  );

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set("page", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSelectCloset = (closet: PublicClosetDetail) => {
    setIsOpen(false);
    pushParams((p) => {
      p.set("closetId", closet.id);
      // Specific closet: filter by closetId only; do not combine with closet-wide catalog flag.
      p.delete("onlyWithCloset");
    });
  };

  const handleClearCloset = () => {
    setIsOpen(false);
    pushParams((p) => {
      p.delete("closetId");
      // "All closets" on Closet Drops: every listing must belong to some closet (not the full marketplace).
      p.set("onlyWithCloset", "true");
    });
  };

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const triggerLabel = unknownClosetFilter
    ? "Closet filter"
    : selected
      ? closetLabel(selected)
      : "All closets";

  const triggerThumb = selected ? closetThumb(selected) : null;

  return (
    <div ref={dropdownRef} className="relative min-w-0 max-w-[min(100%,220px)] sm:max-w-[280px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between gap-2 px-4 py-2 border bg-white w-full text-sm hover:bg-gray-50 disabled:opacity-60"
      >
        <span className="truncate flex items-center gap-2 min-w-0">
          {triggerThumb ? (
            <img
              src={triggerThumb}
              alt=""
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
          )}
          <Paragraph1 className="truncate">{triggerLabel}</Paragraph1>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full border border-gray-200 left-0 right-0 mt-2 bg-white shadow-lg z-50 max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={handleClearCloset}
            className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-200 ${
              !closetIdInUrl ? "bg-gray-50" : ""
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
            <Paragraph1 className="font-medium">All closets</Paragraph1>
          </button>

          {isLoading ? (
            <div className="px-3 py-4">
              <Paragraph1 className="text-gray-500 text-sm">
                Loading closets…
              </Paragraph1>
            </div>
          ) : closets.length === 0 ? (
            <div className="px-3 py-4">
              <Paragraph1 className="text-gray-500 text-sm">
                No public closets yet.
              </Paragraph1>
            </div>
          ) : (
            closets.map((closet) => {
              const thumb = closetThumb(closet);
              const label = closetLabel(closet);
              const active = closet.id === closetIdInUrl;
              return (
                <button
                  type="button"
                  key={closet.id}
                  onClick={() => handleSelectCloset(closet)}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-200 last:border-b-0 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                      {label.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 text-left">
                    <Paragraph1 className="truncate">{label}</Paragraph1>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
