import React from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface TimelineEvent {
  /** The status label (e.g., "Submitted", "In Review") */
  status: string;
  /** The date the status was reached */
  date: string;
  /** A brief description of the event */
  description: string;
}

interface DisputeTimelineContentProps {
  /** Array of timeline events, ordered chronologically */
  events: TimelineEvent[];
}

// Sub-component for a single timeline event
const TimelineItem: React.FC<{ event: TimelineEvent }> = ({ event }) => {
  return (
    <div className="flex relative pb-8 last:pb-0">
      {/* Vertical Line and Dot */}
      <div className="absolute top-0 left-2 w-0.5 h-full bg-gray-200"></div>
      <div className="w-4 h-4 rounded-full bg-yellow-600 absolute left-0 z-10"></div>

      {/* Content */}
      <div className="ml-8 pt-0.5">
        <Paragraph1 className="text-sm font-semibold text-gray-900 mb-1">
          {event.status}{" "}
          <span className="text-gray-700 font-normal">{event.date}</span>
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-600">
          {event.description}
        </Paragraph1>
      </div>
    </div>
  );
};

const DisputeTimelineContent: React.FC<DisputeTimelineContentProps> = ({
  events,
}) => {
  return (
    <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl ">
      <Paragraph1 className="text-sm font-bold text-gray-900 uppercase mb-6">
        DISPUTE TIMELINE
      </Paragraph1>

      <div className="pl-2">
        {events.map((event, index) => (
          <TimelineItem key={index} event={event} />
        ))}
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleDisputeTimeline: React.FC = () => {
  const sampleEvents: TimelineEvent[] = [
    {
      status: "Submitted",
      date: "28 Oct 2025",
      description: "Dispute created and submitted for review.",
    },
    {
      status: "In Review",
      date: "29 Oct 2025",
      description: "Our team is reviewing your case and evidence.",
    },
    // Add more potential future events here (e.g., Investigation Complete, Resolution Proposed, Resolved)
  ];

  return <DisputeTimelineContent events={sampleEvents} />;
};

export default ExampleDisputeTimeline;
