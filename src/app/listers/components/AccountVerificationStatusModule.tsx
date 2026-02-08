import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineDocumentText, HiOutlineCreditCard } from "react-icons/hi2";

// Define possible status types for the badge
type StatusType = "Verified" | "Pending" | "Failed";

interface VerificationBadgeProps {
  status: StatusType;
}

// Sub-component for the Verification Badge
const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "Verified":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "Pending":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "Failed":
      colorClass = "bg-red-100 text-red-800";
      break;
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

interface VerificationItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StatusType;
}

// Sub-component for a single verification item row
const VerificationItem: React.FC<VerificationItemProps> = ({ title, description, icon, status }) => (
    <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white  hover:bg-gray-50 transition duration-150">
        <div className="flex items-center space-x-3">
            <div className="text-gray-500 shrink-0">
                {icon}
            </div>
            <div>
                <Paragraph1 className="text-sm font-medium text-gray-900">{title}</Paragraph1>
                <Paragraph1 className="text-xs text-gray-500">{description}</Paragraph1>
            </div>
        </div>
        <VerificationBadge status={status} />
    </div>
);


const VerificationStatusModule: React.FC = () => {
  return (
    <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl ">
      
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Verifications Status
      </Paragraph1>

      <div className="space-y-4">
        
        {/* 1. Identification (NIN) */}
        <VerificationItem
            title="NIN Document"
            description="NIN_Document_2025.pdf • 2.4 MB"
            icon={<HiOutlineDocumentText className="w-12 h-12" />}
            status="Verified"
        />

        {/* 2. Bank Verification Number (BVN) */}
        <VerificationItem
            title="Bank Verification Number (BVN)"
            description="Linked to account ending **345"
            icon={<HiOutlineCreditCard className="w-6 h-6" />}
            status="Verified"
        />
        
        {/* Add more verification items here if needed */}
        {/* <VerificationItem
            title="Proof of Address"
            description="Utility Bill"
            icon={<HiOutlineDocumentText className="w-6 h-6" />}
            status="Pending"
        /> */}
      </div>
      
    

    </div>
  );
};

export default VerificationStatusModule;