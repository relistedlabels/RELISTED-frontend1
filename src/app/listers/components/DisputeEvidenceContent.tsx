// ENDPOINTS: GET /api/listers/disputes/:disputeId/evidence (uploaded files)
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
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden  flex flex-col cursor-pointer hover:shadow-md transition duration-150">
      {/* File Preview/Placeholder Area */}
      <div className="grow h-40 flex items-center justify-center bg-gray-50">
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
      <div className="bg-black text-white p-2">
        <Paragraph1 className="text-xs truncate text-center">
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
      <Paragraph1 className="text-sm font-bold text-gray-900 uppercase mb-4">
        UPLOADED EVIDENCE
      </Paragraph1>

      {files.length === 0 ? (
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <Paragraph1 className="text-sm text-gray-600">
            No evidence files have been uploaded for this dispute yet.
          </Paragraph1>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2  gap-4">
          {files.map((file, index) => (
            <EvidenceFileCard key={index} {...file} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleDisputeEvidence: React.FC = () => {
  const sampleFiles: EvidenceFile[] = [
    {
      fileName: "damage_photo_1.jpg",
      fileType: "image",
      // fileUrl: "url/to/image_1.jpg",
    },
    {
      fileName: "damage_photo_2.jpg",
      fileType: "image",
      // fileUrl: "url/to/image_2.jpg",
    },
    {
      fileName: "receipt_01.pdf",
      fileType: "document",
    },
  ];

  return <DisputeEvidenceContent files={sampleFiles} />;
};
export { DisputeEvidenceContent };
export default ExampleDisputeEvidence;
