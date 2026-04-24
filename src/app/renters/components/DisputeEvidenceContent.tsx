// ENDPOINTS: GET /api/renters/disputes/:disputeId/evidence

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlinePhoto, HiOutlineDocument } from "react-icons/hi2";

interface EvidenceFile {
  /** The name of the file (e.g., "damage_photo_1.jpg") */
  fileName: string;
  /** The type of file (image or document) for icon/preview */
  fileType: "image" | "document";
  /** Optional URL for the file thumbnail/preview */
  fileUrl?: string;
}

interface DisputeEvidenceContentProps {
  /** Array of uploaded files */
  files: EvidenceFile[];
}

// Sub-component for a single evidence item card
const EvidenceFileCard: React.FC<EvidenceFile> = ({
  fileName,
  fileType,
  fileUrl,
}) => {
  const isImage = fileType === "image";

  return (
    <div className="flex flex-col bg-white hover:shadow-md border border-gray-200 rounded-xl w-full overflow-hidden transition duration-150 cursor-pointer">
      {/* File Preview/Placeholder Area */}
      <div className="flex justify-center items-center bg-gray-50 h-40 grow">
        {fileUrl && isImage ? (
          <img
            src={fileUrl}
            alt={`Evidence: ${fileName}`}
            className="w-full h-full object-cover"
          />
        ) : isImage ? (
          <HiOutlinePhoto className="w-12 h-12 text-gray-300" />
        ) : (
          <HiOutlineDocument className="w-12 h-12 text-gray-300" />
        )}
      </div>

      {/* File Name Footer */}
      <div className="bg-black p-2 text-white">
        <Paragraph1 className="text-xs text-center truncate">
          {fileName}
        </Paragraph1>
      </div>
    </div>
  );
};

const DisputeEvidenceContent: React.FC<DisputeEvidenceContentProps> = ({
  files,
}) => {
  return (
    <div className="font-sans">
      <Paragraph1 className="mb-4 font-bold text-gray-900 text-sm uppercase">
        UPLOADED EVIDENCE
      </Paragraph1>

      {files.length === 0 ? (
        <div className="bg-white p-4 border border-gray-200 rounded-xl">
          <Paragraph1 className="text-gray-600 text-sm">
            No evidence files have been uploaded for this dispute yet.
          </Paragraph1>
        </div>
      ) : (
        <div className="gap-4 grid grid-cols-2 sm:grid-cols-2">
          {files.map((file, index) => (
            <EvidenceFileCard key={index} {...file} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputeEvidenceContent;
