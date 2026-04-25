// ENDPOINTS: GET /api/renters/disputes/:disputeId, GET /api/renters/disputes/:disputeId/overview, GET /api/renters/disputes/:disputeId/evidence, GET /api/renters/disputes/:disputeId/timeline, GET /api/renters/disputes/:disputeId/resolution, GET /api/renters/disputes/:disputeId/messages

"use client";

import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  useDisputeDetails,
  useDisputeEvidence,
  useDisputeOverview,
  useDisputeResolution,
  useDisputeTimeline,
} from "@/lib/queries/renters/useDisputes";
import { useOrders } from "@/lib/queries/renters/useOrders";
import DisputeConversationLog from "./DisputeConversationLog";
import DisputeEvidenceContent from "./DisputeEvidenceContent";
import DisputeOverviewContent from "./DisputeOverviewContent";
import DisputeResolutionContent from "./DisputeResolutionContent";
import DisputeTimelineContent from "./DisputeTimelineContent";

type TabKey = "overview" | "evidence" | "timeline" | "messages" | "resolution";

interface Tab {
  key: TabKey;
  label: string;
}

// Define the tabs based on the image provided
const DISPUTE_TABS: Tab[] = [
  { key: "overview", label: "Overview" },
  { key: "evidence", label: "Evidence" },
  { key: "timeline", label: "Timeline" },
  { key: "messages", label: "Messages" },
  { key: "resolution", label: "Resolution" },
];

const DisputeDetailTabs: React.FC<{ disputeId: string }> = ({ disputeId }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { data: dispute } = useDisputeDetails(disputeId);
  const { data: overview } = useDisputeOverview(disputeId);
  const { data: evidence } = useDisputeEvidence(disputeId);
  const { data: timeline } = useDisputeTimeline(disputeId);
  const { data: resolution } = useDisputeResolution(disputeId);
  const { data: ordersData } = useOrders(undefined, 1, 100, "newest");

  const disputeStatusKey = String(dispute?.status ?? "")
    .trim()
    .replaceAll("-", "_")
    .toUpperCase();

  const canUploadEvidence = ![
    "RESOLVED",
    "REJECTED",
    "WITHDRAW",
    "WITHDRAWN",
  ].includes(disputeStatusKey);

  const ordersByOrderId = React.useMemo(() => {
    const orders = (ordersData as any)?.orders ?? [];
    const map = new Map<string, any>();
    for (const o of orders) {
      if (o?.orderId) map.set(String(o.orderId), o);
    }
    return map;
  }, [ordersData]);

  const listerNameFromOrders = React.useMemo(() => {
    const orderNumber = dispute?.orderId ?? overview?.orderID ?? null;
    if (!orderNumber) return null;
    const order = ordersByOrderId.get(String(orderNumber));
    return order?.listerName || null;
  }, [dispute?.orderId, ordersByOrderId, overview?.orderID]);

  const otherPartyName =
    listerNameFromOrders || dispute?.listerName || overview?.curator || null;

  // Effect to calculate and set the indicator position (simulating Framer Motion layout)
  useEffect(() => {
    const activeIndex = DISPUTE_TABS.findIndex((tab) => tab.key === activeTab);
    const activeRef = tabRefs.current[activeIndex];

    if (activeRef) {
      setIndicatorStyle({
        width: activeRef.offsetWidth,
        transform: `translateX(${activeRef.offsetLeft}px)`,
      });
    }
  }, [activeTab]);

  const contentMap: Record<TabKey, React.ReactNode> = {
    overview: overview ? (
      <DisputeOverviewContent
        itemName={overview.itemName}
        curator={
          overview.curator && overview.curator !== "Unknown"
            ? overview.curator
            : listerNameFromOrders || "Unknown"
        }
        orderID={overview.orderID ?? "—"}
        category={overview.category}
        dateSubmitted={new Date(overview.dateSubmitted).toLocaleDateString()}
        preferredResolution={overview.preferredResolution ?? "—"}
        description={overview.description}
      />
    ) : (
      <div className="bg-white p-4 border border-gray-200 rounded-xl">
        <Paragraph1 className="text-gray-600 text-sm">Loading...</Paragraph1>
      </div>
    ),
    evidence: (
      <DisputeEvidenceContent
        files={
          evidence?.files?.map((f) => ({
            fileName: f.fileName,
            fileType:
              f.fileType?.toLowerCase().includes("image") ||
              f.fileType?.toLowerCase() === "image"
                ? "image"
                : "document",
            fileUrl: f.fileUrl,
          })) ?? []
        }
      />
    ),
    timeline: <DisputeTimelineContent events={timeline?.events ?? []} />,
    messages: (
      <DisputeConversationLog
        disputeId={disputeId}
        canUpload={canUploadEvidence}
        otherPartyName={otherPartyName ?? undefined}
      />
    ),
    resolution: (
      <DisputeResolutionContent
        resolution={{
          status:
            resolution?.status?.toLowerCase() === "resolved"
              ? "Resolved"
              : "Reviewing",
          resolutionDetails: resolution?.resolutionDetails ?? undefined,
          refundAmount:
            typeof resolution?.refundAmount === "number"
              ? `₦${resolution.refundAmount.toLocaleString()}`
              : undefined,
          refundDate: resolution?.refundDate ?? undefined,
        }}
      />
    ),
  };

  return (
    <div className="font-sans">
      {/* Tab Navigation Bar */}
      <div className="inline-flex relative bg-white mb-6 p-1 border border-gray-200 rounded-full">
        {/* Animated Indicator (Simulating Motion) */}
        <div
          className="top-0 left-0 absolute bg-black rounded-full h-full transition-all duration-300 ease-in-out b -600"
          style={indicatorStyle}
        ></div>

        {DISPUTE_TABS.map((tab, index) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              type="button"
              key={tab.key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => setActiveTab(tab.key)}
              // z-10 ensures the text/button is above the indicator
              className={`py-1 sm:px-4 px-3 relative z-4 text-center text-sm font-semibold transition duration-300 ${
                isActive
                  ? "text-white" // Active Tab Style
                  : "text-gray-700 hover:text-gray-900" // Inactive Tab Style
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div>{contentMap[activeTab]}</div>
    </div>
  );
};

const DisputeDetail: React.FC<{ disputeId: string }> = ({ disputeId }) => {
  const { data: dispute } = useDisputeDetails(disputeId);
  const statusKey = String(dispute?.status ?? "")
    .trim()
    .replaceAll("-", "_")
    .toUpperCase();

  const badge =
    statusKey === "IN_REVIEW" || statusKey === "UNDER_REVIEW"
      ? {
          label: "In Review",
          className: "bg-blue-100 text-blue-800",
          Icon: FileText,
        }
      : statusKey === "PENDING" || statusKey === "PENDING_REVIEW"
        ? {
            label: "Pending Review",
            className: "bg-yellow-100 text-yellow-800",
            Icon: Clock,
          }
        : statusKey === "RESOLVED" || statusKey === "RESELOVED"
          ? {
              label: "Resolved",
              className: "bg-green-100 text-green-800",
              Icon: CheckCircle,
            }
          : statusKey === "REJECTED"
            ? {
                label: "Rejected",
                className: "bg-red-100 text-red-800",
                Icon: XCircle,
              }
            : statusKey === "WITHDRAW" || statusKey === "WITHDRAWN"
              ? {
                  label: "Withdrawn",
                  className: "bg-gray-100 text-gray-800",
                  Icon: XCircle,
                }
              : {
                  label: dispute?.status?.trim?.()
                    ? String(dispute?.status)
                    : "Pending Review",
                  className: "bg-gray-100 text-gray-800",
                  Icon: FileText,
                };

  return (
    <div className="">
      <div
        className={`inline-flex items-center mb-4 px-3 py-2 rounded-full font-semibold text-sm ${badge.className}`}
      >
        <badge.Icon className="mr-2 w-4 h-4" />
        <Paragraph1>{badge.label}</Paragraph1>
      </div>
      <DisputeDetailTabs disputeId={disputeId} />
    </div>
  );
};

export default DisputeDetail;
