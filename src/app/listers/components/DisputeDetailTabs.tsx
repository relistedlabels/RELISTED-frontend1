// ENDPOINTS: GET /api/listers/disputes/:disputeId (full details with all tabs)
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { FileText } from "lucide-react";
import { DisputeOverviewContent } from "./DisputeOverviewContent";
import { DisputeEvidenceContent } from "./DisputeEvidenceContent";
import { DisputeTimelineContent } from "./DisputeTimelineContent";
import {
  DisputeResolutionContent,
  type Resolution,
} from "./DisputeResolutionContent";
import DisputeConversationLog from "./DisputeConversationLog";
import {
  useDisputeDetail,
  useDisputeOverview,
  useDisputeEvidence,
  useDisputeTimeline,
  useDisputeResolution,
} from "@/lib/queries/listers";

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
}

const DisputeDetailTabs: React.FC<DisputeDetailTabsProps> = ({ disputeId }) => {
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

  const overview = overviewData?.data.overview;
  const evidence = evidenceData?.data.evidence;
  const timeline = timelineData?.data.timeline;
  const resolutionApi = resolutionData?.data.resolution;

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
          preferredResolution={overview.disputeDetails.preferredResolution}
          description={overview.disputeDetails.description}
        />
        <div className="mt-6">
          <DisputeConversationLog disputeId={disputeId} />
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
      <div className="relative bg-white rounded-full border border-gray-200 p-1 mb-6 inline-flex ">
        {/* Animated Indicator (Simulating Motion) */}
        <div
          className="absolute h-full top-0 left-0 b bg-black -600 rounded-full transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        ></div>

        {DISPUTE_TABS.map((tab, index) => {
          const isActive = tab.key === activeTab;

          return (
            <button
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
  return (
    <div className="">
      <div className="inline-flex items-center px-3 py-2 mb-4 rounded-full bg-yellow-500/50 text-gray-900 font-semibold text-sm">
        <FileText />
        <Paragraph1> In Review </Paragraph1>
      </div>
      <DisputeDetailTabs disputeId={disputeId} />
    </div>
  );
};

export default ExampleDisputeDetail;
