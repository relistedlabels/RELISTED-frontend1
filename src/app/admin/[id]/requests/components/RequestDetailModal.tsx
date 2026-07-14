"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, RefreshCw, X } from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { AdminListingThumb } from "@/app/admin/lib/adminListingDisplay";
import type { AvailabilityRequest } from "@/lib/api/admin/availabilityRequests";
import { useAvailabilityRequestById } from "@/lib/queries/admin/useAvailabilityRequests";
import {
  useNudgeAvailabilityRequestRenter,
  useResendAvailabilityRequestToLister,
} from "@/lib/mutations/admin";
import {
  formatLagosDate,
  formatWindowRange,
} from "@/lib/checkout/dispatchWindows";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value?: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWindow = (window: { start: string; end: string } | null): string => {
  if (!window) return "—";
  return formatWindowRange(window);
};

const formatRentalDateRange = (
  start?: string | null,
  end?: string | null,
): string => {
  if (!start && !end) return "—";
  if (start && end) {
    return `${formatLagosDate(start)} – ${formatLagosDate(end)}`;
  }
  return formatLagosDate((start || end)!);
};

export function getAvailabilityStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Awaiting lister";
    case "ACCEPTED":
      return "Approved";
    case "ORDERED":
      return "Ordered";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED_BY_RENTER":
      return "Withdrawn";
    default:
      return status;
  }
}

export function getAvailabilityStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-800";
    case "ORDERED":
      return "bg-blue-100 text-blue-800";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "EXPIRED":
      return "bg-orange-100 text-orange-800";
    case "CANCELLED_BY_RENTER":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-4 py-3 border-gray-100 last:border-0 border-b">
      <Paragraph1 className="text-gray-500 text-sm shrink-0">{label}</Paragraph1>
      <div className="text-gray-900 text-sm sm:text-right">{value}</div>
    </div>
  );
}

function PersonBlock({
  label,
  person,
}: {
  label: string;
  person: AvailabilityRequest["requester"];
}) {
  if (!person) {
    return <DetailRow label={label} value="—" />;
  }
  return (
    <DetailRow
      label={label}
      value={
        <div>
          <Paragraph1 className="font-medium text-sm">{person.name}</Paragraph1>
          <Paragraph1 className="text-gray-500 text-xs">
            {person.email || "No email"}
          </Paragraph1>
          {person.phone?.trim() ? (
            <Paragraph1 className="text-gray-500 text-xs">
              {person.phone.trim()}
            </Paragraph1>
          ) : null}
        </div>
      }
    />
  );
}

export default function RequestDetailModal({
  isOpen,
  onClose,
  requestId,
}: RequestDetailModalProps) {
  const { data, isLoading, isError } = useAvailabilityRequestById(
    requestId ?? "",
    isOpen,
  );
  const request = data?.data as AvailabilityRequest | undefined;

  const nudgeMutation = useNudgeAvailabilityRequestRenter();
  const resendMutation = useResendAvailabilityRequestToLister();

  React.useEffect(() => {
    if (!isOpen) {
      nudgeMutation.reset();
      resendMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when panel closes
  }, [isOpen]);

  React.useEffect(() => {
    nudgeMutation.reset();
    resendMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when switching rows
  }, [requestId]);

  const actionBusy = nudgeMutation.isPending || resendMutation.isPending;
  const actionError =
    (nudgeMutation.error as Error | null)?.message ||
    (resendMutation.error as Error | null)?.message ||
    null;
  const actionSuccess =
    nudgeMutation.isSuccess || resendMutation.isSuccess
      ? nudgeMutation.data?.message ||
        resendMutation.data?.message ||
        "Done"
      : null;

  return (
    <AnimatePresence>
      {isOpen && requestId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="z-40 fixed inset-0 bg-black/50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="top-0 right-0 bottom-0 z-50 fixed flex flex-col bg-white shadow-lg w-full md:w-[520px]"
          >
            <div className="bg-white p-6 border-gray-200 border-b shrink-0">
              <div className="flex justify-between items-start gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="-ml-1 p-1 text-gray-400 hover:text-gray-600 transition shrink-0"
                >
                  <X size={20} />
                </button>
                <div className="flex-1">
                  <Paragraph3 className="mb-1 font-bold text-gray-900 text-lg">
                    Request details
                  </Paragraph3>
                  <Paragraph1 className="font-mono text-gray-500 text-xs">
                    {requestId}
                  </Paragraph1>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 p-6 overflow-y-auto">
              {isLoading && (
                <Paragraph1 className="text-gray-500 text-sm">
                  Loading request…
                </Paragraph1>
              )}
              {isError && (
                <Paragraph1 className="text-red-600 text-sm">
                  Could not load this request.
                </Paragraph1>
              )}

              {request && (
                <>
                  <div className="flex items-start gap-4">
                    <AdminListingThumb
                      url={request.product?.image ?? null}
                      alt={request.product?.name}
                    />
                    <div className="flex-1 min-w-0">
                      <Paragraph2 className="font-semibold text-gray-900">
                        {request.product?.name || "Unknown item"}
                      </Paragraph2>
                      <Paragraph1 className="mt-1 text-gray-500 text-sm">
                        {request.product?.brand || "No brand"}
                        {request.product?.listingType
                          ? ` · ${request.product.listingType.replace(/_/g, " ")}`
                          : ""}
                      </Paragraph1>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStatusColor(
                            request.status,
                          )}`}
                        >
                          {getAvailabilityStatusLabel(request.status)}
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.requestType === "purchase"
                              ? "bg-violet-100 text-violet-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {request.requestType === "purchase"
                            ? "Purchase"
                            : "Rental"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Paragraph3 className="mb-2 font-semibold text-gray-900">
                      Summary
                    </Paragraph3>
                    <div className="bg-gray-50 px-4 rounded-xl">
                      <DetailRow
                        label="Estimated value"
                        value={formatCurrency(request.totalPrice)}
                      />
                      {request.requestType === "rental" && (
                        <>
                          <DetailRow
                            label="Rental days"
                            value={`${request.rentalDays} day${request.rentalDays === 1 ? "" : "s"}`}
                          />
                          <DetailRow
                            label="Rental dates"
                            value={formatRentalDateRange(
                              request.startDate,
                              request.endDate,
                            )}
                          />
                        </>
                      )}
                      <DetailRow
                        label="Requested"
                        value={formatDateTime(request.createdAt)}
                      />
                      <DetailRow
                        label="Expires"
                        value={formatDateTime(request.expiresAt)}
                      />
                      <PersonBlock label="Renter" person={request.requester} />
                      <PersonBlock label="Lister" person={request.lister} />
                      {request.rejectionReason && (
                        <DetailRow
                          label="Rejection reason"
                          value={request.rejectionReason}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Paragraph3 className="mb-2 font-semibold text-gray-900">
                      Shipment Windows
                    </Paragraph3>
                    <div className="bg-gray-50 px-4 rounded-xl">
                      {request.requestType === "rental" ? (
                        <>
                          <DetailRow
                            label="Rental delivery"
                            value={formatWindow(request.windows.outbound)}
                          />
                          <DetailRow
                            label="Return pickup"
                            value={formatWindow(request.windows.return)}
                          />
                        </>
                      ) : (
                        <DetailRow
                          label="Resale delivery"
                          value={formatWindow(request.windows.resale)}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {request && (
              <div className="bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-6 pt-4 pb-6 sm:pb-8 border-gray-200 border-t shrink-0">
                {(actionError || actionSuccess) && (
                  <div
                    className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                      actionError
                        ? "bg-red-50 text-red-700"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {actionError || actionSuccess}
                  </div>
                )}

                <div className="gap-2 grid grid-cols-1 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!request.canResendToLister || actionBusy}
                    onClick={() => {
                      nudgeMutation.reset();
                      resendMutation.mutate(request.id);
                    }}
                    className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-40 px-4 py-2.5 rounded-lg font-medium text-white text-sm transition disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={16} />
                    {resendMutation.isPending
                      ? "Resending…"
                      : "Resend to lister"}
                  </button>

                  <button
                    type="button"
                    disabled={!request.canNudgeRenter || actionBusy}
                    onClick={() => {
                      resendMutation.reset();
                      nudgeMutation.mutate({
                        requestId: request.id,
                        intent: "now_available",
                      });
                    }}
                    className="flex justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-40 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-800 text-sm transition disabled:cursor-not-allowed"
                  >
                    <Bell size={16} />
                    {nudgeMutation.isPending
                      ? "Sending…"
                      : "Email renter"}
                  </button>
                </div>

                {!request.canNudgeRenter && (
                  <Paragraph1 className="mt-2 text-gray-400 text-xs">
                    Email renter is only available on expired requests.
                  </Paragraph1>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
