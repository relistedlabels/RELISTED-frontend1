// ENDPOINTS: GET /api/renters/disputes/:disputeId/resolution

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
    <div className="bg-white p-4 border border-gray-200 rounded-xl font-sans">
      <Paragraph1 className="mb-6 font-bold text-gray-900 text-sm uppercase">
        RESOLUTION DETAILS
      </Paragraph1>

      {isResolved ? (
        // --- Resolved State View ---
        <div className="py-8 text-center">
          <div className="flex justify-center items-center bg-green-100 mx-auto mb-4 rounded-full w-16 h-16">
            <TiTick className="w-8 h-8 text-green-600" />
          </div>
          <Paragraph1 className="mb-2 font-bold text-gray-900 text-xl">
            Dispute Resolved!
          </Paragraph1>

          <div className="inline-block bg-gray-50 mt-4 p-4 rounded-lg text-left">
            <Paragraph1 className="mb-1 font-semibold text-gray-800 text-sm">
              Final Decision:
            </Paragraph1>
            <Paragraph1 className="mb-3 text-gray-700 text-sm">
              {resolution.resolutionDetails ||
                "Resolution details provided by the platform."}
            </Paragraph1>

            <div className="flex justify-between pt-2 border-gray-200 border-t">
              <Paragraph1 className="text-gray-600 text-sm">
                Refund Issued:
              </Paragraph1>
              <Paragraph1 className="font-bold text-green-600 text-sm">
                {resolution.refundAmount || "N/A"}
              </Paragraph1>
            </div>
            <div className="flex justify-between">
              <Paragraph1 className="text-gray-600 text-sm">
                Date Processed:
              </Paragraph1>
              <Paragraph1 className="font-medium text-gray-800 text-sm">
                {resolution.refundDate || "N/A"}
              </Paragraph1>
            </div>
          </div>
        </div>
      ) : (
        // --- Reviewing/Pending State View (Matches Image) ---
        <div className="py-8 text-center">
          <HiOutlineDocumentText className="mx-auto mb-4 w-12 h-12 text-gray-300" />
          <Paragraph1 className="mb-1 font-semibold text-gray-600 text-lg">
            No resolution yet
          </Paragraph1>
          <Paragraph1 className="text-gray-500 text-sm">
            Your dispute is currently being reviewed
          </Paragraph1>
        </div>
      )}
    </div>
  );
};

export default DisputeResolutionContent;
