// ENDPOINTS: GET /api/renters/disputes/:disputeId/timeline

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
    <div className="relative flex pb-8 last:pb-0">
      {/* Vertical Line and Dot */}
      <div className="top-0 left-2 absolute bg-gray-200 w-0.5 h-full"></div>
      <div className="left-0 z-10 absolute bg-yellow-600 rounded-full w-4 h-4"></div>

      {/* Content */}
      <div className="ml-8 pt-0.5">
        <Paragraph1 className="mb-1 font-semibold text-gray-900 text-sm">
          {event.status}{" "}
          <span className="font-normal text-gray-700">{event.date}</span>
        </Paragraph1>
        <Paragraph1 className="text-gray-600 text-sm">
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
    <div className="bg-white p-4 border border-gray-200 rounded-xl font-sans">
      <Paragraph1 className="mb-6 font-bold text-gray-900 text-sm uppercase">
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

export default DisputeTimelineContent;
