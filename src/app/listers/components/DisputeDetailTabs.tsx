// ENDPOINTS: GET /api/listers/disputes/:disputeId (full details with all tabs)
"use client";

import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  useDisputeDetail,
  useDisputeEvidence,
  useDisputeOverview,
  useDisputeResolution,
  useDisputeTimeline,
  useOrderDetails,
} from "@/lib/queries/listers";
import DisputeConversationLog from "./DisputeConversationLog";
import { DisputeEvidenceContent } from "./DisputeEvidenceContent";
import { DisputeOverviewContent } from "./DisputeOverviewContent";
import {
  DisputeResolutionContent,
  type Resolution,
} from "./DisputeResolutionContent";
import { DisputeTimelineContent } from "./DisputeTimelineContent";

type TabKey = "overview" | "evidence" | "timeline" | "resolution";

interface Tab {
  key: TabKey;
  label: string;
}

// Define the tabs based on the image provided
const DISPUTE_TABS: Tab[] = [
  { key: "overview", label: "Overview" },
  { key: "evidence", label: "Evidence" },
  { key: "timeline", label: "Timeline" },
  { key: "resolution", label: "Resolution" },
];

interface DisputeDetailTabsProps {
  disputeId: string;
  canUploadEvidence?: boolean;
}

const statusBadgeConfig = (status: string | undefined) => {
  const key = String(status ?? "")
    .trim()
    .replaceAll("-", "_")
    .toUpperCase();

  if (
    key === "IN_REVIEW" ||
    key === "UNDER_REVIEW" ||
    key === "IN_REVIEW_DISPUTES"
  ) {
    return {
      label: "In Review",
      className: "bg-blue-100 text-blue-800",
      Icon: FileText,
    };
  }

  if (key === "PENDING" || key === "PENDING_REVIEW") {
    return {
      label: "Pending Review",
      className: "bg-yellow-100 text-yellow-800",
      Icon: Clock,
    };
  }

  if (key === "RESOLVED" || key === "RESELOVED") {
    return {
      label: "Resolved",
      className: "bg-green-100 text-green-800",
      Icon: CheckCircle,
    };
  }

  if (key === "REJECTED") {
    return {
      label: "Rejected",
      className: "bg-red-100 text-red-800",
      Icon: XCircle,
    };
  }

  if (key === "WITHDRAW" || key === "WITHDRAWN") {
    return {
      label: "Withdrawn",
      className: "bg-gray-100 text-gray-800",
      Icon: XCircle,
    };
  }

  return {
    label: status?.trim() ? String(status) : "Pending Review",
    className: "bg-gray-100 text-gray-800",
    Icon: FileText,
  };
};

const DisputeDetailTabs: React.FC<DisputeDetailTabsProps> = ({
  disputeId,
  canUploadEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const { data: overviewData } = useDisputeOverview(disputeId);
  const { data: evidenceData } = useDisputeEvidence(disputeId);
  const { data: timelineData } = useDisputeTimeline(disputeId);
  const { data: resolutionData } = useDisputeResolution(disputeId);
  const { data: detailData } = useDisputeDetail(disputeId);

  const overview = overviewData?.data.overview;
  const evidence = evidenceData?.data.evidence;
  const timeline = timelineData?.data.timeline;
  const resolutionApi = resolutionData?.data.resolution;
  const dispute = detailData?.data.dispute;

  const orderIdForRenterName =
    String(dispute?.orderNumber ?? "").trim() ||
    String(overview?.itemInformation.orderId ?? "").trim() ||
    "";
  const { data: orderDetailsData } = useOrderDetails(orderIdForRenterName);
  const orderDetails =
    (orderDetailsData as unknown as { data?: { order?: Record<string, unknown> } })
      ?.data?.order ??
    (orderDetailsData as unknown as { data?: Record<string, unknown> })?.data ??
    null;
  const otherPartyName =
    String((orderDetails as any)?.renterName ?? "").trim() || undefined;

  const resolution: Resolution | undefined = resolutionApi
    ? {
        status:
          resolutionApi.status.toLowerCase() === "resolved"
            ? "Resolved"
            : "Reviewing",
        resolutionDetails: resolutionApi.resolutionDetails || undefined,
        refundAmount: resolutionApi.formattedAmount || undefined,
        refundDate: resolutionApi.refundDate || undefined,
      }
    : undefined;

  const contentMap: Record<TabKey, React.ReactNode> = {
    overview: overview && (
      <>
        <DisputeOverviewContent
          itemName={overview.itemInformation.itemName}
          curator={overview.itemInformation.curator}
          orderID={overview.itemInformation.orderId}
          category={overview.disputeDetails.category}
          dateSubmitted={overview.disputeDetails.dateSubmitted}
          preferredResolution={
            overview.disputeDetails.preferredResolution ?? "—"
          }
          description={overview.disputeDetails.description}
        />
        <div className="mt-6">
          <DisputeConversationLog
            disputeId={disputeId}
            canUpload={canUploadEvidence}
            otherPartyName={otherPartyName}
          />
        </div>
      </>
    ),
    evidence: (
      <DisputeEvidenceContent
        files={(evidence?.files || []).map((f) => ({
          fileName: f.fileName,
          fileType: f.fileType === "document" ? "document" : "image",
          fileUrl: f.fileUrl,
        }))}
      />
    ),
    timeline: (
      <DisputeTimelineContent
        events={(timeline?.events || []).map((e) => ({
          status: e.status,
          date: e.displayDate,
          description: e.description,
        }))}
      />
    ),
    resolution: resolution ? (
      <DisputeResolutionContent resolution={resolution} />
    ) : null,
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

const ExampleDisputeDetail: React.FC<{ disputeId: string }> = ({
  disputeId,
}) => {
  const { data: disputeDetail } = useDisputeDetail(disputeId);
  const badge = statusBadgeConfig(
    disputeDetail?.data.dispute.status ??
      disputeDetail?.data.dispute.statusLabel,
  );
  const disputeStatusKey = String(
    disputeDetail?.data.dispute.status ??
      disputeDetail?.data.dispute.statusLabel ??
      "",
  )
    .trim()
    .replaceAll("-", "_")
    .toUpperCase();
  const canUploadEvidence = ![
    "RESOLVED",
    "REJECTED",
    "WITHDRAW",
    "WITHDRAWN",
  ].includes(disputeStatusKey);
  const Icon = badge.Icon;

  return (
    <div className="">
      <div
        className={`inline-flex items-center px-3 py-2 mb-4 rounded-full font-semibold text-sm ${badge.className}`}
      >
        <Icon className="mr-2 w-4 h-4" />
        <Paragraph1>{badge.label}</Paragraph1>
      </div>
      <DisputeDetailTabs
        disputeId={disputeId}
        canUploadEvidence={canUploadEvidence}
      />
    </div>
  );
};

export default ExampleDisputeDetail;
