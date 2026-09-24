"use client";

import { Truck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

export type DispatchPreviewGroup = {
  bucketIndex?: number;
  groupHeading: string | null;
  listerLocation?: string;
  rows: Array<{ title: string; range: string }>;
};

export type DispatchPreviewLeg = "outbound" | "return";

function isOutboundRow(title: string): boolean {
  const normalized = title.toLowerCase();
  return normalized.includes("delivery") || normalized.includes("purchase");
}

function isReturnRow(title: string): boolean {
  return title.toLowerCase().includes("return");
}

export function filterDispatchPreviewGroups(
  groups: DispatchPreviewGroup[] | undefined,
  bucketIndex: number | undefined,
  leg: DispatchPreviewLeg,
): DispatchPreviewGroup[] {
  if (!groups?.length) return [];

  const rowFilter = leg === "outbound" ? isOutboundRow : isReturnRow;
  const scoped =
    bucketIndex !== undefined
      ? groups.filter((group) => group.bucketIndex === bucketIndex)
      : groups;

  return scoped
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => rowFilter(row.title)),
    }))
    .filter((group) => group.rows.length > 0);
}

function DispatchPreviewContent({
  groups,
  leg,
}: {
  groups: DispatchPreviewGroup[];
  leg: DispatchPreviewLeg;
}) {
  return (
    <div className="space-y-2.5">
      {groups.map((group, groupIndex) => {
        const showRowLabels = group.rows.length > 1;

        return (
          <div
            key={`${group.bucketIndex ?? "all"}-${groupIndex}`}
            className="space-y-1.5"
          >
            {showRowLabels ? (
              <div className="space-y-2">
                {group.rows.map((row) => (
                  <div key={`${row.title}-${row.range}`}>
                    <Paragraph1 className="font-semibold text-gray-900 text-[11px] uppercase tracking-wide">
                      {row.title}
                    </Paragraph1>
                    <Paragraph1 className="mt-0.5 font-medium text-gray-900 text-[15px] leading-snug tabular-nums">
                      {row.range}
                    </Paragraph1>
                  </div>
                ))}
              </div>
            ) : group.rows[0] ? (
              <Paragraph1 className="font-medium text-gray-900 text-[15px] leading-snug tabular-nums">
                {group.rows[0].range}
              </Paragraph1>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type CheckoutDispatchLegPreviewProps = {
  groups?: DispatchPreviewGroup[];
  bucketIndex?: number;
  leg: DispatchPreviewLeg;
};

/** Dispatch details only (e.g. per-bucket block in a multi-shipment card). */
export default function CheckoutDispatchLegPreview({
  groups,
  bucketIndex,
  leg,
}: CheckoutDispatchLegPreviewProps) {
  const filtered = filterDispatchPreviewGroups(groups, bucketIndex, leg);
  if (filtered.length === 0) return null;

  return (
    <div className="mb-1 border-gray-900 border-l-2 pl-3">
      <DispatchPreviewContent groups={filtered} leg={leg} />
    </div>
  );
}

type CheckoutShippingLegHeaderProps = {
  sectionLabel: string;
  groups?: DispatchPreviewGroup[];
  bucketIndex?: number;
  leg: DispatchPreviewLeg;
};

/** Section label, dispatch summary, and truck icon in one header row. */
export function CheckoutShippingLegHeader({
  sectionLabel,
  groups,
  bucketIndex,
  leg,
}: CheckoutShippingLegHeaderProps) {
  const filtered = filterDispatchPreviewGroups(groups, bucketIndex, leg);
  const hasPreview = filtered.length > 0;

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0 flex-1 border-gray-900 border-l-2 pl-3">
        <Paragraph1 className="font-bold text-[11px] text-gray-900 uppercase tracking-[0.12em]">
          {sectionLabel}
        </Paragraph1>
        {hasPreview ? (
          <div className="mt-2">
            <DispatchPreviewContent groups={filtered} leg={leg} />
          </div>
        ) : null}
      </div>
      <Truck size={22} className="mt-0.5 text-gray-700 shrink-0" aria-hidden />
    </div>
  );
}
