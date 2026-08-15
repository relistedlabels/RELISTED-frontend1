"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import type { AdminReturnRequest } from "@/lib/api/admin/orders";
import {
  formatLagosDate,
  formatWindowRange,
} from "@/lib/checkout/dispatchWindows";

interface ReturnRequestSectionProps {
  returnRequest: AdminReturnRequest | null | undefined;
  /** When false, hide the section entirely (e.g. non-return shipments). */
  visible?: boolean;
}

const conditionBadgeClass =
  "inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700";

const statusBadgeClass = (status: string): string => {
  const key = status.trim().toUpperCase();
  if (key === "COMPLETED") return "bg-green-100 text-green-700";
  if (key === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-800";
};

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PhotoGrid({ urls, label }: { urls: string[]; label: string }) {
  const validUrls = urls.filter((url) => url?.trim());

  return (
    <div>
      <Paragraph1 className="mb-2 font-medium text-gray-700 text-sm">
        {label}
        {validUrls.length > 0 ? ` (${validUrls.length})` : ""}
      </Paragraph1>
      {validUrls.length === 0 ? (
        <Paragraph1 className="text-gray-500 text-sm">None uploaded</Paragraph1>
      ) : (
        <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
          {validUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="group relative bg-white shadow-sm border border-gray-200 rounded-xl aspect-square overflow-hidden hover:ring-2 hover:ring-gray-900 transition-all"
              aria-label={`${label} ${index + 1}, open full size`}
            >
              <img
                src={url}
                alt={`${label} ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReturnRequestSection({
  returnRequest,
  visible = true,
}: ReturnRequestSectionProps) {
  if (!visible) return null;

  return (
    <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
      <Paragraph3 className="mb-4 font-bold text-gray-900 text-base">
        Return request
      </Paragraph3>

      {!returnRequest ? (
        <Paragraph1 className="text-gray-600 text-sm leading-relaxed">
          No return request has been submitted for this order yet.
        </Paragraph1>
      ) : (
        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <Paragraph1 className="mb-1 text-gray-500 text-xs">Status</Paragraph1>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(
                  returnRequest.status,
                )}`}
              >
                {returnRequest.statusLabel}
              </span>
            </div>
            <div>
              <Paragraph1 className="mb-1 text-gray-500 text-xs">Submitted</Paragraph1>
              <Paragraph1 className="font-medium text-gray-900 text-sm">
                {formatSubmittedAt(returnRequest.createdAt)}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                Renter condition report
              </Paragraph1>
              <span className={conditionBadgeClass}>
                {returnRequest.itemCondition}
              </span>
            </div>
            {returnRequest.listerCondition && (
              <div>
                <Paragraph1 className="mb-1 text-gray-500 text-xs">
                  Lister condition report
                </Paragraph1>
                <span className={conditionBadgeClass}>
                  {returnRequest.listerCondition}
                </span>
              </div>
            )}
          </div>

          {(returnRequest.pickupWindowStart && returnRequest.pickupWindowEnd) ||
          returnRequest.pickupAddress ? (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              {returnRequest.pickupWindowStart &&
                returnRequest.pickupWindowEnd && (
                  <div>
                    <Paragraph1 className="mb-1 text-gray-500 text-xs">
                      Pickup window
                    </Paragraph1>
                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                      {formatWindowRange({
                        start: returnRequest.pickupWindowStart,
                        end: returnRequest.pickupWindowEnd,
                      })}
                    </Paragraph1>
                  </div>
                )}
              {returnRequest.pickupAddress && (
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Pickup address
                  </Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                    {returnRequest.pickupAddress}
                  </Paragraph1>
                </div>
              )}
            </div>
          ) : null}

          {returnRequest.trackingNumber && (
            <div>
              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                Return tracking
              </Paragraph1>
              <Paragraph1 className="font-medium text-gray-900 text-sm">
                {returnRequest.trackingNumber}
              </Paragraph1>
            </div>
          )}

          <div>
            <Paragraph1 className="mb-1 text-gray-500 text-xs">
              Renter damage notes
            </Paragraph1>
            <Paragraph1 className="text-gray-800 text-sm leading-relaxed">
              {returnRequest.damageNotes?.trim() || "None reported"}
            </Paragraph1>
          </div>

          {returnRequest.listerDamageNotes?.trim() && (
            <div>
              <Paragraph1 className="mb-1 text-gray-500 text-xs">
                Lister damage notes
              </Paragraph1>
              <Paragraph1 className="text-gray-800 text-sm leading-relaxed">
                {returnRequest.listerDamageNotes}
              </Paragraph1>
            </div>
          )}

          <PhotoGrid urls={returnRequest.imageUrls} label="Renter photos" />
          {(returnRequest.listerConfirmationImages.length > 0 ||
            returnRequest.listerCondition) && (
            <PhotoGrid
              urls={returnRequest.listerConfirmationImages}
              label="Lister confirmation photos"
            />
          )}

          {(returnRequest.shippedAt || returnRequest.deliveredAt) && (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 pt-2 border-gray-200 border-t">
              {returnRequest.shippedAt && (
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">Shipped</Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                    {formatLagosDate(returnRequest.shippedAt, {
                      includeWeekday: true,
                    })}
                  </Paragraph1>
                </div>
              )}
              {returnRequest.deliveredAt && (
                <div>
                  <Paragraph1 className="mb-1 text-gray-500 text-xs">
                    Delivered to lister
                  </Paragraph1>
                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                    {formatLagosDate(returnRequest.deliveredAt, {
                      includeWeekday: true,
                    })}
                  </Paragraph1>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
