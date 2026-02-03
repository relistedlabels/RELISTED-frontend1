import React, { useState, useRef, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { FileText } from "lucide-react";
import ExampleDisputeOverview from "./DisputeOverviewContent";
import ExampleDisputeEvidence from "./DisputeEvidenceContent";
import ExampleDisputeTimeline from "./DisputeTimelineContent";
import ExampleDisputeResolution from "./DisputeResolutionContent";

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

const DisputeDetailTabs: React.FC = () => {
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

  // --- Placeholder Content Components ---
  const OverviewContent: React.FC = () => <ExampleDisputeOverview />;

  const EvidenceContent: React.FC = () => <ExampleDisputeEvidence />;

  const TimelineContent: React.FC = React.memo(() => (
    <ExampleDisputeTimeline />
  ));

  const ResolutionContent: React.FC = () => (
   <ExampleDisputeResolution />
  );

  const contentMap: Record<TabKey, React.ReactNode> = {
    overview: <OverviewContent />,
    evidence: <EvidenceContent />,
    timeline: <TimelineContent />,
    resolution: <ResolutionContent />,
  };
  // ------------------------------------

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

const ExampleDisputeDetail: React.FC = () => {
  return (
    <div className="">
      <div className="inline-flex items-center px-3 py-2 mb-4 rounded-full bg-yellow-500/50 text-gray-900 font-semibold text-sm">
        <FileText />
        <Paragraph1> In Review </Paragraph1>
      </div>
      <DisputeDetailTabs />
    </div>
  );
};

export default ExampleDisputeDetail;
