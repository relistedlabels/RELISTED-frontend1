"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import type { DisputeDetail, DisputeStatus } from "@/lib/api/admin/disputes";
import { normalizeAdminDisputeStatus } from "@/lib/api/admin/disputes";
import {
  useResolveDispute,
  useUpdateDisputeStatus,
} from "@/lib/mutations/admin";
import {
  formatMoney,
  getDisputeResolutionCaps,
  type DisputeInitiator,
} from "./disputeResolutionCaps";
import { AdminComboBox } from "@/app/admin/components/AdminComboBox";

const DISPUTE_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "IN_DISPUTE", label: "In Dispute" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAW", label: "Withdrawn" },
] as const;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseAmountInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export interface DisputeResolutionPanelProps {
  disputeId: string | null;
  disputeDetail: DisputeDetail | Record<string, unknown> | null | undefined;
}

export function DisputeResolutionPanel({
  disputeId,
  disputeDetail,
}: DisputeResolutionPanelProps) {
  const caps = useMemo(
    () => getDisputeResolutionCaps(disputeDetail),
    [disputeDetail],
  );

  const statusNorm = normalizeAdminDisputeStatus(
    (disputeDetail as Record<string, unknown> | null | undefined)?.status,
  );
  const allowFinancialResolve =
    statusNorm !== "RESOLVED" &&
    statusNorm !== "REJECTED" &&
    statusNorm !== "WITHDRAW";

  const updateStatusMutation = useUpdateDisputeStatus();
  const resolveMutation = useResolveDispute();

  const [nextStatus, setNextStatus] = useState<DisputeStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [refundPercent, setRefundPercent] = useState(0);
  const [collateralPercent, setCollateralPercent] = useState(0);
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [collateralAmountInput, setCollateralAmountInput] = useState("");

  const currentStatus = normalizeAdminDisputeStatus(
    (disputeDetail as any)?.status,
  );
  const effectiveStatus = (nextStatus || currentStatus) as DisputeStatus | "";

  const initiator: DisputeInitiator = caps.initiator;

  useEffect(() => {
    setNextStatus("");
    setStatusNote("");
    setResolutionDetails("");
    setRefundPercent(0);
    setCollateralPercent(0);
    setRefundAmountInput("");
    setCollateralAmountInput("");
  }, [disputeId]);

  const setRefundFromPercent = (percent: number) => {
    setRefundPercent(percent);
    const amount = Math.round((percent / 100) * caps.refundMax);
    setRefundAmountInput(String(amount));
  };

  const setCollateralFromPercent = (percent: number) => {
    setCollateralPercent(percent);
    const amount = Math.round((percent / 100) * caps.collateralMax);
    setCollateralAmountInput(String(amount));
  };

  const setRefundFromAmount = (raw: string) => {
    setRefundAmountInput(raw);
    const n = parseAmountInput(raw);
    if (n == null || caps.refundMax <= 0) return;
    setRefundPercent(Math.round(clamp((n / caps.refundMax) * 100, 0, 100)));
  };

  const setCollateralFromAmount = (raw: string) => {
    setCollateralAmountInput(raw);
    const n = parseAmountInput(raw);
    if (n == null || caps.collateralMax <= 0) return;
    setCollateralPercent(
      Math.round(clamp((n / caps.collateralMax) * 100, 0, 100)),
    );
  };

  const initiatorLabel =
    initiator === "lister"
      ? "Opened by lister"
      : initiator === "renter"
        ? "Opened by renter"
        : "Initiator unclear — both controls shown";

  const handleResolve = async () => {
    if (!disputeId) return;
    const details = resolutionDetails.trim();
    if (!details) {
      toast.error("Add resolution details");
      return;
    }

    let refundValue = parseAmountInput(refundAmountInput);
    let collateralValue = parseAmountInput(collateralAmountInput);

    if (refundValue === null || collateralValue === null) {
      toast.error("Amounts must be valid numbers");
      return;
    }

    refundValue = clamp(refundValue, 0, caps.refundMax);
    collateralValue = clamp(collateralValue, 0, caps.collateralMax);

    if (initiator === "lister") {
      refundValue = 0;
    } else if (initiator === "renter") {
      collateralValue = 0;
    }

    try {
      await resolveMutation.mutateAsync({
        disputeId,
        resolutionDetails: details,
        refundAmount: refundValue,
        collateralWithheldToLister: collateralValue,
      });
      toast.success("Dispute resolved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to resolve dispute");
    }
  };

  const showCollateralPrimary =
    initiator === "lister" || initiator === "unknown";
  const showRefundPrimary =
    initiator === "renter" || initiator === "unknown";

  const noCompensationHint =
    showRefundPrimary && showCollateralPrimary
      ? "Set both amounts to 0 to close without compensation."
      : "Set the amount to 0 to close without compensation.";

  return (
    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
      <Paragraph1 className="mb-3 text-gray-500 text-xs">ACTIONS</Paragraph1>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <Paragraph1 className="mb-2 font-semibold text-gray-900 text-sm">
            Update status only
          </Paragraph1>
          <Paragraph1 className="mb-3 text-gray-500 text-xs">
            Change workflow state without moving money. Use when the dispute is
            still in review or being reassigned.
          </Paragraph1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <AdminComboBox
              value={effectiveStatus}
              onChange={(value) => setNextStatus(value as DisputeStatus)}
              options={[...DISPUTE_STATUS_OPTIONS]}
              placeholder="Select status"
              ariaLabel="Dispute status"
            />
            <button
              type="button"
              className="shrink-0 bg-gray-900 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm"
              disabled={
                !disputeId ||
                !effectiveStatus ||
                updateStatusMutation.isPending
              }
              onClick={async () => {
                if (!disputeId || !effectiveStatus) return;
                try {
                  await updateStatusMutation.mutateAsync({
                    disputeId,
                    status: effectiveStatus,
                    note:
                      statusNote.trim() ||
                      (effectiveStatus === "IN_REVIEW" ||
                      effectiveStatus === "IN_DISPUTE"
                        ? "Status updated by admin"
                        : undefined),
                  });
                  toast.success("Dispute status updated");
                } catch (error: any) {
                  toast.error(error?.message || "Failed to update status");
                }
              }}
            >
              {updateStatusMutation.isPending ? "Updating…" : "Save status"}
            </button>
          </div>
          <input
            className="bg-white mt-3 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
            placeholder="Optional note"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
          {updateStatusMutation.isError && (
            <Paragraph1 className="mt-2 text-red-600 text-sm">
              Failed to update status
            </Paragraph1>
          )}
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          {!allowFinancialResolve ? (
            <>
              <Paragraph1 className="mb-1 font-semibold text-gray-900 text-sm">
                Financial resolution
              </Paragraph1>
              <Paragraph1 className="text-gray-500 text-sm">
                This dispute is already resolved. Use “Update status only” if
                you need a metadata change.
              </Paragraph1>
            </>
          ) : (
            <>
              <Paragraph1 className="mb-1 font-semibold text-gray-900 text-sm">
                Resolve &amp; settle
              </Paragraph1>
              <Paragraph1 className="mb-3 text-gray-500 text-xs">
                Saves the resolution and settles funds. {noCompensationHint}
              </Paragraph1>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {initiatorLabel}
                </span>
                {showRefundPrimary && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                    Refund from payout pool (max){" "}
                    {formatMoney(caps.refundMax)}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  {initiator === "lister"
                    ? "Dispute cap (collateral)"
                    : "Collateral to lister (max)"}{" "}
                  {formatMoney(caps.collateralMax)}
                </span>
              </div>

              <textarea
                className="bg-white mb-4 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm min-h-[88px]"
                placeholder="Resolution summary (required)"
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
              />

              {showRefundPrimary && (
                <div className="mb-4">
                  <Paragraph1 className="mb-1 text-gray-700 text-sm font-medium">
                    {initiator === "renter"
                      ? "Refund to renter (% of locked escrow payout)"
                      : "Refund to renter (optional)"}
                  </Paragraph1>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        disabled={caps.refundMax <= 0}
                        value={refundPercent}
                        onChange={(e) =>
                          setRefundFromPercent(Number(e.target.value))
                        }
                        className="flex-1 accent-gray-900"
                      />
                      <span className="w-12 text-right text-sm font-medium text-gray-900">
                        {refundPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Paragraph1 className="text-gray-500 text-xs shrink-0">
                        Amount (NGN)
                      </Paragraph1>
                      <input
                        className="bg-white flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        inputMode="numeric"
                        value={refundAmountInput}
                        onChange={(e) => setRefundFromAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {showCollateralPrimary && (
                <div className="mb-4">
                  <Paragraph1 className="mb-1 text-gray-700 text-sm font-medium">
                    {initiator === "lister"
                      ? "Award to lister from renter collateral (% of collateral held)"
                      : "Award to lister from collateral (optional)"}
                  </Paragraph1>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        disabled={caps.collateralMax <= 0}
                        value={collateralPercent}
                        onChange={(e) =>
                          setCollateralFromPercent(Number(e.target.value))
                        }
                        className="flex-1 accent-gray-900"
                      />
                      <span className="w-12 text-right text-sm font-medium text-gray-900">
                        {collateralPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Paragraph1 className="text-gray-500 text-xs shrink-0">
                        Amount (NGN)
                      </Paragraph1>
                      <input
                        className="bg-white flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        inputMode="numeric"
                        value={collateralAmountInput}
                        onChange={(e) =>
                          setCollateralFromAmount(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition"
                disabled={
                  !disputeId ||
                  !resolutionDetails.trim() ||
                  resolveMutation.isPending
                }
                onClick={() => void handleResolve()}
              >
                {resolveMutation.isPending
                  ? "Resolving…"
                  : "Resolve dispute (status + settlement)"}
              </button>
              {resolveMutation.isError && (
                <Paragraph1 className="mt-2 text-red-600 text-sm">
                  Failed to resolve dispute
                </Paragraph1>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
