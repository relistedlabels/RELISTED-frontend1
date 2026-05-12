"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
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

function RelistedLogoCircle({ size }: { size: "sm" | "md" }) {
  const box = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const img = size === "sm" ? 14 : 20;
  const nudge = size === "sm" ? "translate-x-[1px]" : "translate-x-[2px]";
  return (
    <span
      className={`${box} rounded-full bg-black shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-gray-200/80`}
    >
      <span className={`flex items-center justify-center ${nudge}`}>
        <Image
          src="/images/logo.svg"
          alt=""
          width={img}
          height={img}
          className="block max-w-full max-h-full object-contain"
          unoptimized
        />
      </span>
    </span>
  );
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
        className="flex justify-between items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-60 px-4 py-2 border w-full text-sm"
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {triggerThumb ? (
            <img
              src={triggerThumb}
              alt=""
              className="rounded-full w-6 h-6 object-cover shrink-0"
            />
          ) : (
            <RelistedLogoCircle size="sm" />
          )}
          <Paragraph1 className="truncate">{triggerLabel}</Paragraph1>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="top-full right-0 left-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={handleClearCloset}
            className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-200 ${
              !closetIdInUrl ? "bg-gray-50" : ""
            }`}
          >
            <RelistedLogoCircle size="md" />
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
                      className="rounded-full w-8 h-8 object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8 font-bold text-[10px] text-gray-600 shrink-0">
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
