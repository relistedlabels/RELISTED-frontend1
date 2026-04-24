"use client";
// ENDPOINTS: GET /api/admin/disputes?status=pending&search=, GET /api/admin/disputes/:disputeId

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import type { Dispute, DisputeStatus } from "@/lib/api/admin/disputes";
import {
  useResolveDispute,
  useUpdateDisputeStatus,
} from "@/lib/mutations/admin";
import { useDisputeById } from "@/lib/queries/admin/useDisputes";

interface PendingDisputeData {
  id: string;
  raisedBy: string;
  raiserRole: string;
  raisedByAvatar: string | null;
  listerName: string;
  renterName: string;
  category: string;
  orderId: string;
  preferredResolution: string;
  dateCreated: string;
  status: "Pending";
}

interface PendingTableProps {
  searchQuery: string;
  disputes?: Dispute[];
}

function displayName(person: any): string {
  if (!person) return "";
  if (typeof person === "string") return person;
  if (typeof person.name === "string" && person.name.trim()) return person.name;
  if (typeof person.fullName === "string" && person.fullName.trim())
    return person.fullName;
  const firstName =
    typeof person.firstName === "string" ? person.firstName.trim() : "";
  const lastName =
    typeof person.lastName === "string" ? person.lastName.trim() : "";
  const combined = `${firstName} ${lastName}`.trim();
  if (combined) return combined;
  if (typeof person.username === "string" && person.username.trim())
    return person.username;
  if (typeof person.email === "string" && person.email.trim())
    return person.email;
  return "";
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatMoney(value: number | null | undefined): string {
  const safe = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
}

// Transform Dispute API response to display format
function transformDisputeData(dispute: Dispute): PendingDisputeData {
  const raisedBy = dispute.raisedBy as any;
  const id = String(dispute.id ?? (dispute as any).disputeId ?? "");
  const raisedByName =
    displayName(raisedBy) ??
    (dispute as any).raisedByName ??
    (typeof (raisedBy as unknown) === "string"
      ? String(raisedBy)
      : undefined) ??
    "—";
  const raisedByRole = raisedBy?.role ?? (dispute as any).raisedByRole ?? "—";
  const raisedByAvatar =
    typeof raisedBy?.avatar === "string"
      ? raisedBy.avatar
      : typeof (dispute as any).raisedByAvatar === "string"
        ? (dispute as any).raisedByAvatar
        : null;
  const dateCreatedRaw = (dispute as any).createdAt ?? (dispute as any).dateCreated;
  const listerName = displayName((dispute as any).lister) || "—";
  const renterName = displayName((dispute as any).renter) || "—";
  const preferredResolution = String(
    (dispute as any).preferredResolution ?? "—",
  );

  return {
    id,
    raisedBy: raisedByName,
    raiserRole: String(raisedByRole),
    raisedByAvatar,
    listerName,
    renterName,
    category: String(dispute.category ?? (dispute as any).issueCategory ?? "—"),
    orderId: String(dispute.orderId ?? (dispute as any).orderNumber ?? "—"),
    preferredResolution,
    dateCreated: dateCreatedRaw
      ? new Date(dateCreatedRaw).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    status: "Pending",
  };
}

export default function PendingTable({
  searchQuery,
  disputes,
}: PendingTableProps) {
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );
  const { data: disputeDetailResponse, isLoading: disputeDetailLoading } =
    useDisputeById(selectedDisputeId ?? "");

  const displayData = disputes?.map(transformDisputeData) ?? [];

  const filteredData = useMemo(() => {
    return displayData.filter(
      (item) =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.listerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.renterName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, displayData]);

  const disputeDetail = disputeDetailResponse?.data;
  const raisedByParty =
    (disputeDetail as any)?.raisedBy ??
    (disputeDetail as any)?.createdBy ??
    (disputeDetail as any)?.raiser;
  const otherParty =
    (disputeDetail as any)?.otherParty ??
    (disputeDetail as any)?.counterParty ??
    (disputeDetail as any)?.otherUser;

  const raisedByName =
    displayName(raisedByParty) ??
    (disputeDetail as any)?.raisedByName ??
    (typeof raisedByParty === "string" ? raisedByParty : undefined) ??
    "—";
  const raisedByRole =
    (raisedByParty as any)?.role ?? (disputeDetail as any)?.raisedByRole ?? "—";
  const otherPartyName =
    displayName(otherParty) ??
    (typeof otherParty === "string" ? otherParty : undefined) ??
    "—";
  const otherPartyRole = (otherParty as any)?.role ?? "—";

  const updateStatusMutation = useUpdateDisputeStatus();
  const resolveMutation = useResolveDispute();
  const [nextStatus, setNextStatus] = useState<DisputeStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [collateralWithheldToLister, setCollateralWithheldToLister] =
    useState("");
  const currentStatus = String((disputeDetail as any)?.status ?? "") as
    | DisputeStatus
    | "";
  const effectiveStatus = (nextStatus || currentStatus) as DisputeStatus | "";
  const escrow = (disputeDetail as any)?.orderDetails?.escrow;
  const escrowStatus = String(escrow?.status ?? "");
  const collateralLocked = toNumberOrNull(escrow?.collateralAmount) ?? 0;
  const rentalAmount = toNumberOrNull(escrow?.rentalAmount) ?? 0;
  const cleaningFee = toNumberOrNull(escrow?.cleaningFee) ?? 0;
  const resaleAmount = toNumberOrNull(escrow?.resaleAmount) ?? 0;
  const payoutLocked =
    escrowStatus === "LOCKED"
      ? rentalAmount + cleaningFee + resaleAmount
      : escrowStatus === "PARTIALLY_RELEASED"
        ? cleaningFee + resaleAmount
        : 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-gray-200 border-b">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                DISPUTE ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                RAISED BY
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                LISTER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                RENTER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                CATEGORY
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                ORDER ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                PREFERRED RESOLUTION
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                DATE CREATED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                STATUS
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="font-semibold text-gray-900">
                ACTION
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center">
                <Paragraph1 className="text-gray-500">
                  No pending disputes found
                </Paragraph1>
              </td>
            </tr>
          ) : (
            filteredData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 border-gray-200 border-b transition-colors"
              >
                <td className="px-6 py-4">
                  <Paragraph1 className="font-medium text-gray-900">
                    {item.id}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.raisedByAvatar ? (
                      <img
                        src={item.raisedByAvatar}
                        alt={item.raisedBy}
                        className="rounded-full w-8 h-8"
                      />
                    ) : (
                      <div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8">
                        <Paragraph1 className="font-semibold text-gray-700 text-xs">
                          {(item.raisedBy || "U")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </Paragraph1>
                      </div>
                    )}
                    <div>
                      <Paragraph1 className="font-medium text-gray-900">
                        {item.raisedBy}
                      </Paragraph1>
                      <Paragraph1 className="text-gray-500 text-xs">
                        {item.raiserRole}
                      </Paragraph1>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.listerName}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.renterName}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.category}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="font-medium text-gray-900">
                    {item.orderId}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.preferredResolution}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.dateCreated}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 px-3 py-1 rounded-full font-medium text-yellow-700 text-xs">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium"
                    onClick={() => setSelectedDisputeId(item.id)}
                  >
                    <Paragraph1>View Details</Paragraph1>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <AnimatePresence>
        {selectedDisputeId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDisputeId(null)}
              className="z-40 fixed inset-0 bg-black/50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="top-0 right-0 bottom-0 z-50 fixed bg-white shadow-lg w-full md:w-3/4 overflow-y-auto"
            >
              <div className="top-0 sticky bg-white p-6 border-gray-200 border-b">
                <div className="flex justify-between items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDisputeId(null)}
                    className="flex-shrink-0 -ml-1 p-1 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex-1">
                    <Paragraph1 className="mb-1 font-bold text-gray-900 text-lg">
                      Dispute Details
                    </Paragraph1>
                    <Paragraph1 className="text-gray-500 text-xs">
                      {selectedDisputeId}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {disputeDetailLoading ? (
                  <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                    <Paragraph1 className="text-gray-600">
                      Loading dispute details...
                    </Paragraph1>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        PARTIES
                      </Paragraph1>
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Paragraph1 className="mb-1 text-gray-500 text-xs">
                            Raised By
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String(raisedByName)}
                          </Paragraph1>
                          <Paragraph1 className="text-gray-600 text-sm">
                            {String(raisedByRole)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="mb-1 text-gray-500 text-xs">
                            Other Party
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String(otherPartyName)}
                          </Paragraph1>
                          <Paragraph1 className="text-gray-600 text-sm">
                            {String(otherPartyRole)}
                          </Paragraph1>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        DISPUTE
                      </Paragraph1>
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Order ID
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String((disputeDetail as any)?.orderDetails?.id ?? (disputeDetail as any)?.orderId ?? "—")}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Order DB ID
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String((disputeDetail as any)?.orderDetails?.dbId ?? "—")}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Category
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String((disputeDetail as any)?.category ?? "—")}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Preferred Resolution
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String((disputeDetail as any)?.preferredResolution ?? "—")}
                          </Paragraph1>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Paragraph1 className="text-gray-600 text-sm">
                          Description
                        </Paragraph1>
                        <Paragraph1 className="text-gray-900">
                          {String((disputeDetail as any)?.description ?? "—")}
                        </Paragraph1>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        ESCROW
                      </Paragraph1>
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Total Amount Paid
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(
                              toNumberOrNull(
                                (disputeDetail as any)?.orderDetails
                                  ?.totalAmountPaid,
                              ),
                            )}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Escrow Status
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {escrowStatus || "—"}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Collateral Locked
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(collateralLocked)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Payout Locked
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(payoutLocked)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Rental Amount
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(rentalAmount)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Cleaning Fee
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(cleaningFee)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Resale Amount
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {formatMoney(resaleAmount)}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Released At
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {escrow?.releasedAt
                              ? new Date(String(escrow.releasedAt)).toLocaleString(
                                  "en-US",
                                )
                              : "—"}
                          </Paragraph1>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        EVIDENCE
                      </Paragraph1>
                      {(disputeDetail as any)?.evidence?.uploads?.length ? (
                        <div className="space-y-2">
                          {(disputeDetail as any).evidence.uploads.map(
                            (upload: any) => (
                              <div
                                key={String(upload.id ?? upload.url)}
                                className="flex justify-between items-center gap-3"
                              >
                                <Paragraph1 className="text-gray-900 text-sm">
                                  {String(
                                    upload.fileName ??
                                      upload.name ??
                                      upload.url ??
                                      "—",
                                  )}
                                </Paragraph1>
                                {upload.url ? (
                                  <a
                                    className="text-gray-700 text-sm underline"
                                    href={String(upload.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open
                                  </a>
                                ) : null}
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <Paragraph1 className="text-gray-600 text-sm">
                          —
                        </Paragraph1>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        MESSAGES
                      </Paragraph1>
                      {(disputeDetail as any)?.messages?.length ? (
                        <div className="space-y-3">
                          {(disputeDetail as any).messages.map(
                            (message: any) => (
                              <div
                                key={String(message.id ?? message.createdAt ?? message.timestamp)}
                                className="bg-white p-3 border border-gray-200 rounded-lg"
                              >
                                <div className="flex justify-between items-center gap-3">
                                  <Paragraph1 className="font-medium text-gray-900 text-sm">
                                    {String(message.from ?? message.sender ?? "—")}
                                  </Paragraph1>
                                  <Paragraph1 className="text-gray-500 text-xs">
                                    {String(message.createdAt ?? message.timestamp ?? "—")}
                                  </Paragraph1>
                                </div>
                                <Paragraph1 className="mt-2 text-gray-800 text-sm">
                                  {String(message.content ?? message.message ?? "—")}
                                </Paragraph1>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <Paragraph1 className="text-gray-600 text-sm">
                          —
                        </Paragraph1>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        ACTIONS
                      </Paragraph1>

                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        <div>
                          <Paragraph1 className="mb-2 text-gray-600 text-sm">
                            Update Status
                          </Paragraph1>
                          <div className="flex items-center gap-3">
                            <select
                              className="bg-white px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                              value={effectiveStatus}
                              onChange={(e) =>
                                setNextStatus(e.target.value as DisputeStatus)
                              }
                            >
                              <option value="">Select status</option>
                              <option value="PENDING">Pending</option>
                              <option value="IN_REVIEW">In Review</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="WITHDRAW">Withdrawn</option>
                            </select>
                            <button
                              type="button"
                              className="bg-gray-900 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm"
                              disabled={
                                !selectedDisputeId ||
                                !effectiveStatus ||
                                updateStatusMutation.isPending
                              }
                              onClick={async () => {
                                if (!selectedDisputeId || !effectiveStatus)
                                  return;

                                try {
                                  await updateStatusMutation.mutateAsync({
                                    disputeId: selectedDisputeId,
                                    status: effectiveStatus,
                                    note:
                                      statusNote.trim() ||
                                      (effectiveStatus === "IN_REVIEW"
                                        ? "Assigned and reviewing"
                                        : undefined),
                                  });
                                  toast.success("Dispute status updated");
                                } catch (error: any) {
                                  toast.error(
                                    error?.message || "Failed to update status",
                                  );
                                }
                              }}
                            >
                              {updateStatusMutation.isPending
                                ? "Updating..."
                                : "Update"}
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

                        <div>
                          <Paragraph1 className="mb-2 text-gray-600 text-sm">
                            Resolve Dispute
                          </Paragraph1>
                          <div className="space-y-3">
                            <input
                              className="bg-white px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                              placeholder="Resolution details"
                              value={resolutionDetails}
                              onChange={(e) =>
                                setResolutionDetails(e.target.value)
                              }
                            />
                            <input
                              className="bg-white px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                              placeholder="Refund to renter (from escrow payout)"
                              inputMode="decimal"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                            />
                            <input
                              className="bg-white px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                              placeholder="Award lister from collateral (damage/penalty)"
                              inputMode="decimal"
                              value={collateralWithheldToLister}
                              onChange={(e) =>
                                setCollateralWithheldToLister(e.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm"
                              disabled={
                                !selectedDisputeId ||
                                !resolutionDetails.trim() ||
                                resolveMutation.isPending
                              }
                              onClick={() => {
                                if (!selectedDisputeId) return;
                                const refundValueRaw = refundAmount.trim()
                                  ? Number(refundAmount)
                                  : 0;
                                const collateralValueRaw =
                                  collateralWithheldToLister.trim()
                                    ? Number(collateralWithheldToLister)
                                    : 0;
                                const refundValue =
                                  Number.isFinite(refundValueRaw) &&
                                  refundValueRaw >= 0
                                    ? refundValueRaw
                                    : null;
                                const collateralValue =
                                  Number.isFinite(collateralValueRaw) &&
                                  collateralValueRaw >= 0
                                    ? collateralValueRaw
                                    : null;
                                if (refundValue == null) {
                                  toast.error("Refund amount must be a number");
                                  return;
                                }
                                if (collateralValue == null) {
                                  toast.error(
                                    "Collateral award must be a number",
                                  );
                                  return;
                                }
                                if (refundValue > payoutLocked) {
                                  toast.error(
                                    `Refund must be <= ${formatMoney(payoutLocked)}`,
                                  );
                                  return;
                                }
                                if (collateralValue > collateralLocked) {
                                  toast.error(
                                    `Collateral award must be <= ${formatMoney(collateralLocked)}`,
                                  );
                                  return;
                                }
                                resolveMutation.mutate({
                                  disputeId: selectedDisputeId,
                                  resolutionDetails: resolutionDetails.trim(),
                                  refundAmount:
                                    refundValue !== 0 ? refundValue : 0,
                                  collateralWithheldToLister:
                                    collateralValue !== 0 ? collateralValue : 0,
                                });
                              }}
                            >
                              {resolveMutation.isPending
                                ? "Resolving..."
                                : "Resolve"}
                            </button>
                            {resolveMutation.isError && (
                              <Paragraph1 className="text-red-600 text-sm">
                                Failed to resolve dispute
                              </Paragraph1>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
