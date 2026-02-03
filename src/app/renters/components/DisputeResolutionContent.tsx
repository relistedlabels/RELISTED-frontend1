import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { TiTick } from "react-icons/ti"; // For a Resolved state icon

interface Resolution {
  status: "Reviewing" | "Resolved";
  resolutionDetails?: string;
  refundAmount?: string;
  refundDate?: string;
}

interface DisputeResolutionContentProps {
  resolution: Resolution;
}

const DisputeResolutionContent: React.FC<DisputeResolutionContentProps> = ({
  resolution,
}) => {
  const isResolved = resolution.status === "Resolved";

  return (
    <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl">
      <Paragraph1 className="text-sm font-bold text-gray-900 uppercase mb-6">
        RESOLUTION DETAILS
      </Paragraph1>

      {isResolved ? (
        // --- Resolved State View ---
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <TiTick className="w-8 h-8 text-green-600" />
          </div>
          <Paragraph1 className="text-xl font-bold text-gray-900 mb-2">
            Dispute Resolved!
          </Paragraph1>

          <div className="inline-block text-left mt-4 p-4 bg-gray-50 rounded-lg">
            <Paragraph1 className="text-sm font-semibold text-gray-800 mb-1">
              Final Decision:
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700 mb-3">
              {resolution.resolutionDetails ||
                "Resolution details provided by the platform."}
            </Paragraph1>

            <div className="flex justify-between border-t border-gray-200 pt-2">
              <Paragraph1 className="text-sm text-gray-600">
                Refund Issued:
              </Paragraph1>
              <Paragraph1 className="text-sm font-bold text-green-600">
                {resolution.refundAmount || "N/A"}
              </Paragraph1>
            </div>
            <div className="flex justify-between">
              <Paragraph1 className="text-sm text-gray-600">
                Date Processed:
              </Paragraph1>
              <Paragraph1 className="text-sm font-medium text-gray-800">
                {resolution.refundDate || "N/A"}
              </Paragraph1>
            </div>
          </div>
        </div>
      ) : (
        // --- Reviewing/Pending State View (Matches Image) ---
        <div className="text-center py-8">
          <HiOutlineDocumentText className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          <Paragraph1 className="text-lg font-semibold text-gray-600 mb-1">
            No resolution yet
          </Paragraph1>
          <Paragraph1 className="text-sm text-gray-500">
            Your dispute is currently being reviewed
          </Paragraph1>
        </div>
      )}
    </div>
  );
};

// --- Example Usage matching the provided image content (Reviewing State) ---

const ExampleDisputeResolution: React.FC = () => {
  const sampleReviewingResolution: Resolution = {
    status: "Reviewing",
  };

  // Example of a resolved state (if needed for testing)
  // const sampleResolvedResolution: Resolution = {
  //   status: "Resolved",
  //   resolutionDetails: "Full refund issued due to confirmed damage to the item.",
  //   refundAmount: "₦55,000",
  //   refundDate: "05 Nov 2025"
  // };

  return <DisputeResolutionContent resolution={sampleReviewingResolution} />;
};

export default ExampleDisputeResolution;
