import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineHome,
} from "react-icons/hi2";

// Sub-component for displaying a verification status on a document or field
const VerificationBadge: React.FC<{
  status: "Verified" | "Pending" | "Failed";
}> = ({ status }) => {
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
    <span
      className={`px-4 py-2 rounded-sm text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
};

const AccountVerificationsForm: React.FC = () => {
  return (
    <div className="font-sans w-full">
      <Paragraph1 className="mb-6 uppercase font-bold">
        Verifications
      </Paragraph1>

      {/* Identification Section */}
      <Paragraph1 className="text-lg text-gray-900 mb-4">
        Identification
      </Paragraph1>

      {/* Uploaded NIN Document */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-3 border border-gray-300 rounded-lg bg-white mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <HiOutlineDocumentText className="w-10 h-10 sm:w-14 sm:h-14 text-gray-500 shrink-0" />
          <div className="min-w-0">
            <Paragraph1 className="text-sm font-medium text-gray-900 truncate">
              NIN_Document_2025.pdf
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-500">
              PDF • 2.4 MB
            </Paragraph1>
          </div>
        </div>

        <div className="sm:self-center">
          <VerificationBadge status="Verified" />
        </div>
      </div>

      {/* Bank Verification */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Bank Verification Number
      </Paragraph1>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Paragraph1 className="text-base text-gray-900">BVN</Paragraph1>
        </div>
        <div className=" border bg-gray-50 border-gray-300 rounded-lg flex justify-between items-center p-4">
          <input
            type="text"
            defaultValue="********34-345"
            readOnly
            className="w-full outline-none  text-lg tracking-wider text-gray-700 font-mono"
          />

          <VerificationBadge status="Verified" />
        </div>

        <Paragraph1 className="text-xs text-gray-500 mt-2">
          Your BVN is encrypted and secure. Only the last 4 digits are shown.
        </Paragraph1>
      </div>

      {/* Emergency Contact */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4 pt-4 border-t border-gray-100">
        Emergency Contact Information
      </Paragraph1>
      <Paragraph1 className="text-sm text-gray-600 mb-4">
        Emergency contact details for your account
      </Paragraph1>

      {/* Grid becomes 1-column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Full Name */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Full Name
          </Paragraph1>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              defaultValue="Sarah Jessica Parker"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Email Address
          </Paragraph1>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              defaultValue="samathadani@gmail.com"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </Paragraph1>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              defaultValue="0923848556"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Relationship */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Relationship
          </Paragraph1>
          <div className="relative">
            <HiOutlineUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              defaultValue="Sibling"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Address
        </Paragraph1>
        <div className="relative">
          <HiOutlineHome className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            defaultValue="20, Allen Street, Diamond Bay Estate, Lekki Lagos state, Nigeria"
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-6">
        <button className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AccountVerificationsForm;
