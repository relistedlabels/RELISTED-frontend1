"use client";
// ENDPOINTS: GET /api/admin/disputes?status=under-review&search=, GET /api/admin/disputes/:disputeId, PUT /api/admin/disputes/:disputeId/assign

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import {
  normalizeAdminDisputeStatus,
  type Dispute,
  type DisputeStatus,
} from "@/lib/api/admin/disputes";
import {
  useResolveDispute,
  useUpdateDisputeStatus,
} from "@/lib/mutations/admin";
import { useDisputeById } from "@/lib/queries/admin/useDisputes";

interface UnderReviewDisputeData {
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
  assignedTo: string;
  status: "Under Review";
}

interface UnderReviewTableProps {
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

type DisputeMessageType = "user" | "admin" | "status";

type MessageAttachment = {
  id?: string;
  url?: string;
  thumbnailUrl?: string;
  name?: string;
  type?: string;
  size?: number;
};

type MessageSender = {
  id?: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string;
};

const isProbablyUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

const isImageUrl = (value: string) =>
  /^data:image\//i.test(value) || /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(value);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const toAbsoluteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isProbablyUrl(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (!API_BASE_URL) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
};

const normalizeMessageType = (value: unknown): DisputeMessageType => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "status") return "status";
  if (normalized === "admin") return "admin";
  return "user";
};

const formatTimestamp = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMessageDate = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (parsed.toDateString() === today.toDateString()) return "Today";
  if (parsed.toDateString() === yesterday.toDateString()) return "Yesterday";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      parsed.getFullYear() !== today.getFullYear()
        ? "numeric"
        : undefined,
  });
};

const getMessageDateKey = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toDateString();
};

const getInitials = (name: string) => {
  const safe = String(name ?? "").trim();
  if (!safe) return "U";
  return safe
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const getSender = (
  message: Record<string, unknown>,
): MessageSender | undefined =>
  typeof message.sender === "object" && message.sender
    ? (message.sender as MessageSender)
    : {
        ...(typeof message.senderId === "string" && message.senderId.trim()
          ? { id: message.senderId.trim() }
          : {}),
        ...(typeof message.senderRole === "string" && message.senderRole.trim()
          ? { role: message.senderRole.trim() }
          : {}),
        ...(typeof message.senderName === "string" && message.senderName.trim()
          ? { name: message.senderName.trim() }
          : {}),
        ...(typeof message.sender === "string" && message.sender.trim()
          ? { name: message.sender.trim() }
          : {}),
      };

const extractAttachments = (raw: unknown): MessageAttachment[] => {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;
  const possible =
    r.uploads ??
    r.attachmentUrls ??
    r.attachments ??
    r.mediaUrls ??
    r.media ??
    r.mediaIds;
  if (!Array.isArray(possible)) return [];
  return possible
    .map((value: unknown) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return isProbablyUrl(trimmed) ? { url: trimmed } : { id: trimmed };
      }
      if (value && typeof value === "object") {
        const v = value as Record<string, unknown>;
        const id = String(
          v.id ?? v.uploadId ?? v.mediaId ?? v.media_id ?? "",
        ).trim();
        const url = String(
          v.url ?? v.fileUrl ?? v.secure_url ?? v.src ?? "",
        ).trim();
        const thumbnailUrl = String(
          v.thumbnailUrl ?? v.thumbnail_url ?? v.thumbUrl ?? v.thumb_url ?? "",
        ).trim();
        const name = String(v.name ?? v.fileName ?? v.filename ?? "").trim();
        const type = String(v.type ?? v.fileType ?? "").trim();
        const size = toNumberOrNull(v.size ?? v.fileSize ?? "");
        if (!id && !url) return null;
        return {
          ...(id ? { id } : {}),
          ...(url ? { url } : {}),
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
          ...(name ? { name } : {}),
          ...(type ? { type } : {}),
          ...(size !== null ? { size } : {}),
        };
      }
      return null;
    })
    .filter((value): value is MessageAttachment => Boolean(value));
};

const resolveAttachment = (
  attachment: MessageAttachment,
  uploadsById?: Map<string, { url: string; thumbnailUrl?: string }>,
) => {
  const directUrl = String(attachment.url ?? "").trim();
  const directThumb = String(attachment.thumbnailUrl ?? "").trim();
  const id = String(attachment.id ?? "").trim();
  const upload = id ? uploadsById?.get(id) : undefined;
  const resolvedUrl =
    directUrl || (id && isProbablyUrl(id) ? id : "") || upload?.url || "";
  const fullUrl = toAbsoluteUrl(resolvedUrl);
  if (!fullUrl) return undefined;
  return {
    fullUrl,
    thumbUrl:
      toAbsoluteUrl(directThumb || upload?.thumbnailUrl || upload?.url || "") ||
      fullUrl,
    name: attachment.name,
    type: attachment.type,
  };
};

const inferMessageParty = (
  message: Record<string, unknown>,
  disputeDetail: Record<string, unknown> | undefined,
): "renter" | "lister" | "admin" | "unknown" => {
  const senderRoleField = String(
    (message as any)?.senderRole ?? (message as any)?.sender_role ?? "",
  )
    .trim()
    .toLowerCase();
  if (senderRoleField === "renter") return "renter";
  if (senderRoleField === "lister") return "lister";
  if (senderRoleField === "admin") return "admin";

  const senderRole = String(getSender(message)?.role ?? "")
    .trim()
    .toLowerCase();
  if (senderRole === "renter") return "renter";
  if (senderRole === "lister") return "lister";
  if (senderRole === "admin") return "admin";

  const createdBy = String(message.createdBy ?? "")
    .trim()
    .toLowerCase();
  if (createdBy === "renter") return "renter";

  const from = String(message.from ?? "")
    .trim()
    .toLowerCase();
  if (from.includes("admin")) return "admin";

  const renter = (disputeDetail as any)?.renter;
  const lister = (disputeDetail as any)?.lister;
  const renterName = String(displayName(renter) ?? "")
    .trim()
    .toLowerCase();
  const listerName = String(displayName(lister) ?? "")
    .trim()
    .toLowerCase();

  if (renterName && from.includes(renterName)) return "renter";
  if (listerName && from.includes(listerName)) return "lister";
  if (from.includes("dresser") || from.includes("renter")) return "renter";
  if (from.includes("curator") || from.includes("lister")) return "lister";
  return "unknown";
};

// Transform Dispute API response to display format
function transformDisputeData(dispute: Dispute): UnderReviewDisputeData {
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
  const dateCreatedRaw =
    (dispute as any).createdAt ?? (dispute as any).dateCreated;
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
    assignedTo: dispute.assignedTo?.name ?? "Unassigned",
    status: "Under Review",
  };
}

export default function UnderReviewTable({
  searchQuery,
  disputes,
}: UnderReviewTableProps) {
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
  const uploadsById = useMemo(() => {
    const map = new Map<string, { url: string; thumbnailUrl?: string }>();
    const uploads = (disputeDetail as any)?.evidence?.uploads ?? [];
    if (Array.isArray(uploads)) {
      for (const u of uploads) {
        const id = String(u?.id ?? "").trim();
        const url = String(u?.url ?? "").trim();
        const thumbnailUrl = String(u?.thumbnailUrl ?? "").trim();
        if (!id || !url) continue;
        map.set(id, {
          url,
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
        });
      }
    }
    return map;
  }, [disputeDetail]);
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
  const currentStatus = normalizeAdminDisputeStatus(
    (disputeDetail as any)?.status,
  );
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
                ASSIGNED TO
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
                  No disputes under review found
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
                  <Paragraph1 className="text-gray-600">
                    {item.assignedTo}
                  </Paragraph1>
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
                    className="-ml-1 p-1 text-gray-400 hover:text-gray-600 transition shrink-0"
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
                            {String(
                              (disputeDetail as any)?.orderDetails?.id ??
                                (disputeDetail as any)?.orderId ??
                                "—",
                            )}
                          </Paragraph1>
                        </div>
                        <div>
                          <Paragraph1 className="text-gray-600 text-sm">
                            Order DB ID
                          </Paragraph1>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {String(
                              (disputeDetail as any)?.orderDetails?.dbId ?? "—",
                            )}
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
                            {String(
                              (disputeDetail as any)?.preferredResolution ??
                                "—",
                            )}
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
                              ? new Date(
                                  String(escrow.releasedAt),
                                ).toLocaleString("en-US")
                              : "—"}
                          </Paragraph1>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <Paragraph1 className="mb-2 text-gray-500 text-xs">
                        EVIDENCE
                      </Paragraph1>
                      {disputeDetail?.evidence?.uploads?.length ? (
                        <div className="space-y-3">
                          <div className="gap-2 grid grid-cols-3">
                            {disputeDetail.evidence.uploads
                              .filter((upload) => {
                                const url = String(upload.url ?? "").trim();
                                const fileType = String(
                                  upload.fileType ?? "",
                                ).toLowerCase();
                                const fileName = String(
                                  upload.fileName ?? "",
                                ).toLowerCase();
                                if (!url) return false;
                                if (fileType.includes("image")) return true;
                                return /\.(png|jpe?g|webp|gif)$/i.test(
                                  fileName,
                                );
                              })
                              .map((upload) => (
                                <a
                                  key={String(upload.id ?? upload.url)}
                                  href={toAbsoluteUrl(String(upload.url ?? ""))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="relative border border-gray-200 rounded-lg w-full aspect-square overflow-hidden"
                                >
                                  <Image
                                    src={toAbsoluteUrl(
                                      String(upload.thumbnailUrl ?? upload.url),
                                    )}
                                    alt={String(upload.fileName ?? "Evidence")}
                                    fill
                                    sizes="120px"
                                    unoptimized
                                    className="object-cover"
                                  />
                                </a>
                              ))}
                          </div>
                          <div className="space-y-2">
                            {disputeDetail.evidence.uploads.map((upload) => (
                              <div
                                key={`file-${String(upload.id ?? upload.url)}`}
                                className="flex justify-between items-center gap-3"
                              >
                                <Paragraph1 className="text-gray-900 text-sm">
                                  {String(upload.fileName ?? upload.url ?? "—")}
                                </Paragraph1>
                                <a
                                  className="text-gray-700 text-sm underline"
                                  href={toAbsoluteUrl(String(upload.url ?? ""))}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </a>
                              </div>
                            ))}
                          </div>
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
                      {disputeDetail?.messages?.length ? (
                        <div className="space-y-4">
                          {(() => {
                            const grouped: Record<
                              string,
                              typeof disputeDetail.messages
                            > = {};
                            for (const msg of disputeDetail.messages) {
                              const key = getMessageDateKey(
                                msg.displayTimestamp ??
                                  msg.createdAt ??
                                  msg.timestamp,
                              );
                              if (!key) continue;
                              if (!grouped[key]) grouped[key] = [];
                              grouped[key].push(msg);
                            }
                            return Object.entries(grouped).map(
                              ([dateKey, messages]) => (
                                <div key={dateKey}>
                                  <div className="flex justify-center my-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-500 text-xs">
                                      {formatMessageDate(
                                        messages[0]?.displayTimestamp ??
                                          messages[0]?.createdAt ??
                                          messages[0]?.timestamp,
                                      )}
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    {messages.map((message) => {
                                      const type = normalizeMessageType(
                                        message.type,
                                      );
                                      const sender = getSender(
                                        message as unknown as Record<
                                          string,
                                          unknown
                                        >,
                                      );
                                      const getSenderNameDisplay = () => {
                                        const name = String(sender?.name ?? "").trim();
                                        if (name) return name;
                                        const created = String(message.createdBy ?? "").trim();
                                        if (created === "renter") return "Renter";
                                        if (created === "lister") return "Lister";
                                        if (created === "admin") return "Admin";
                                        return "User";
                                      };
                                      const senderName = getSenderNameDisplay();
                                      const senderAvatarUrl = String(
                                        sender?.avatarUrl ?? "",
                                      ).trim();

                                      const party = inferMessageParty(
                                        message as unknown as Record<
                                          string,
                                          unknown
                                        >,
                                        disputeDetail as unknown as Record<
                                          string,
                                          unknown
                                        >,
                                      );
                                      const align =
                                        party === "renter"
                                          ? "justify-end"
                                          : party === "admin"
                                            ? "justify-center"
                                            : "justify-start";
                                      const rowDirection =
                                        party === "renter"
                                          ? "flex-row-reverse"
                                          : "flex-row";

                                      if (type === "status") {
                                        return (
                                          <div
                                            key={String(message.id)}
                                            className="flex justify-center"
                                          >
                                            <div className="bg-gray-200 px-3 py-1 rounded-full text-gray-700 text-xs">
                                              {String(message.content ?? "—")}
                                            </div>
                                          </div>
                                        );
                                      }

                                      const attachments =
                                        extractAttachments(message)
                                          .map((attachment) =>
                                            resolveAttachment(
                                              attachment,
                                              uploadsById,
                                            ),
                                          )
                                          .filter(
                                            (
                                              value,
                                            ): value is NonNullable<
                                              ReturnType<
                                                typeof resolveAttachment
                                              >
                                            > => Boolean(value),
                                          );

                                      const senderLabel =
                                        party === "renter"
                                          ? `Renter · ${senderName}`
                                          : party === "lister"
                                            ? `Lister · ${senderName}`
                                            : party === "admin"
                                              ? `Admin · ${senderName}`
                                              : senderName;

                                      const timestamp = formatTimestamp(
                                        message.displayTimestamp ??
                                          message.createdAt ??
                                          message.timestamp,
                                      );
                                      const metaAlignClass =
                                        party === "renter"
                                          ? "text-right"
                                          : party === "admin"
                                            ? "text-center"
                                            : "text-left";

                                      return (
                                        <div
                                          key={String(message.id)}
                                          className={`flex ${align}`}
                                        >
                                          <div
                                            className={`flex items-start gap-2 ${rowDirection}`}
                                          >
                                            {party === "admin" ? null : (
                                              <div className="relative flex justify-center items-center bg-gray-200 rounded-full w-7 h-7 overflow-hidden font-semibold text-[10px] text-gray-600 shrink-0">
                                                <span className="absolute inset-0 flex justify-center items-center">
                                                  {getInitials(senderName)}
                                                </span>
                                                {senderAvatarUrl ? (
                                                  <img
                                                    src={senderAvatarUrl}
                                                    alt={`${senderName} avatar`}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    onError={(e) => {
                                                      e.currentTarget.style.display =
                                                        "none";
                                                    }}
                                                  />
                                                ) : null}
                                              </div>
                                            )}
                                            <div className="max-w-[80%]">
                                              <Paragraph1
                                                className={`mb-1 text-gray-700 text-xs ${metaAlignClass}`}
                                              >
                                                {senderLabel}
                                              </Paragraph1>
                                              <div
                                                className={
                                                  party === "renter"
                                                    ? "bg-black p-3 rounded-lg text-white"
                                                    : party === "lister"
                                                      ? "bg-white p-3 border border-gray-200 rounded-lg text-gray-900"
                                                      : "bg-gray-100 p-3 border border-gray-200 rounded-lg text-gray-900"
                                                }
                                              >
                                                {message.content ? (
                                                  <Paragraph1
                                                    className={
                                                      party === "renter"
                                                        ? "text-xs text-white"
                                                        : "text-gray-800 text-xs"
                                                    }
                                                  >
                                                    {String(message.content)}
                                                  </Paragraph1>
                                                ) : null}
                                                {attachments.length > 0 ? (
                                                  <div className="gap-2 grid grid-cols-3 mt-2">
                                                    {attachments.map(
                                                      ({
                                                        fullUrl,
                                                        thumbUrl,
                                                        type,
                                                      }) => {
                                                        const isImage =
                                                          String(type ?? "")
                                                            .toLowerCase()
                                                            .startsWith(
                                                              "image/",
                                                            ) ||
                                                          isImageUrl(fullUrl);
                                                        return isImage ? (
                                                          <a
                                                            key={fullUrl}
                                                            href={fullUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="relative border border-gray-200 rounded-lg w-24 h-24 overflow-hidden"
                                                          >
                                                            <Image
                                                              src={thumbUrl}
                                                              alt="Attachment"
                                                              fill
                                                              sizes="96px"
                                                              unoptimized
                                                              className="object-cover"
                                                            />
                                                          </a>
                                                        ) : (
                                                          <a
                                                            key={fullUrl}
                                                            href={fullUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm underline"
                                                          >
                                                            Open file
                                                          </a>
                                                        );
                                                      },
                                                    )}
                                                  </div>
                                                ) : null}
                                              </div>
                                              {timestamp ? (
                                                <Paragraph1
                                                  className={`mt-1 text-gray-500 text-xs ${metaAlignClass}`}
                                                >
                                                  {timestamp}
                                                </Paragraph1>
                                              ) : null}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ),
                            );
                          })()}
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
                              <option value="IN_DISPUTE">In Dispute</option>
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
                                      (effectiveStatus === "IN_REVIEW" ||
                                      effectiveStatus === "IN_DISPUTE"
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
