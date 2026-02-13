"use client";

// ENDPOINTS: GET /api/listers/verifications/status, GET /api/listers/verifications/documents,
// POST /api/listers/verifications/nin, GET /api/listers/verifications/bvn,
// PUT /api/listers/verifications/emergency-contact

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineHome,
} from "react-icons/hi2";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useVerificationStatus } from "@/lib/queries/listers/useVerificationStatus";
import { useVerificationDocuments } from "@/lib/queries/listers/useVerificationDocuments";
import { useBvnVerification } from "@/lib/queries/listers/useBvnVerification";
import { useUpdateEmergencyContact } from "@/lib/mutations/listers/useUpdateEmergencyContact";
import { useUploadNinDocument } from "@/lib/mutations/listers/useUploadNinDocument";

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
    <span className={`px-4 py-2 rounded-sm text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

const AccountVerificationsForm: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const { data: statusData } = useVerificationStatus();
  const { data: documentsData } = useVerificationDocuments();
  const { data: bvnData } = useBvnVerification();
  const updateEmergencyContactMutation = useUpdateEmergencyContact();
  const uploadNinMutation = useUploadNinDocument();

  const emergencyContact = profile?.emergencyContact;

  const [emergencyForm, setEmergencyForm] = useState({
    fullName: emergencyContact?.name || "",
    email: "",
    phone: emergencyContact?.phoneNumber || "",
    relationship: emergencyContact?.relationship || "",
  });

  const handleEmergencyChange = (
    field: keyof typeof emergencyForm,
    value: string,
  ) => {
    setEmergencyForm((prev) => ({ ...prev, [field]: value }));
  };

  const emergencyAddress = useMemo(() => {
    if (!emergencyContact) return "";
    const parts = [emergencyContact.city, emergencyContact.state].filter(
      Boolean,
    );
    return parts.join(", ");
  }, [emergencyContact]);

  const ninStatusRaw = statusData?.data.verifications.nin.status ?? "pending";
  const bvnStatusRaw =
    statusData?.data.verifications.bvn.status ?? bvnData?.data.bvn.status;

  const mapStatus = (
    status: string | undefined,
  ): "Verified" | "Pending" | "Failed" => {
    const lower = (status || "").toLowerCase();
    if (lower === "verified") return "Verified";
    if (lower === "pending") return "Pending";
    if (lower === "failed" || lower === "not_verified") return "Failed";
    return "Pending";
  };

  const ninStatus = mapStatus(ninStatusRaw);
  const bvnStatus = mapStatus(bvnStatusRaw);

  const [ninNumber, setNinNumber] = useState("");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);

  const handleNinFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setNinFile(file);
    setNinError(null);
  };

  const handleUploadNin = () => {
    if (!ninFile) {
      setNinError("Please select a NIN document to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("ninDocument", ninFile);
    if (ninNumber.trim()) {
      formData.append("ninNumber", ninNumber.trim());
    }

    setNinError(null);
    uploadNinMutation.mutate(formData, {
      onSuccess: () => {
        setNinNumber("");
        setNinFile(null);
      },
      onError: () => {
        setNinError("Failed to upload NIN document. Please try again.");
      },
    });
  };

  if (isLoading && !profile) {
    return (
      <div className="font-sans w-full">
        <Paragraph1 className="mb-6 uppercase font-bold">
          Verifications
        </Paragraph1>
        <Paragraph1 className="text-sm text-gray-500">
          Loading verification details...
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans w-full">
      <Paragraph1 className="mb-6 uppercase font-bold">
        Verifications
      </Paragraph1>

      {/* Identification Section */}
      <Paragraph1 className="text-lg text-gray-900 mb-4">
        Identification
      </Paragraph1>

      {/* Uploaded NIN Document (basic status driven by profile for now) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-3 border border-gray-300 rounded-lg bg-white mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <HiOutlineDocumentText className="w-10 h-10 sm:w-14 sm:h-14 text-gray-500 shrink-0" />
          <div className="min-w-0">
            <Paragraph1 className="text-sm font-medium text-gray-900 truncate">
              NIN Verification Document
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-500">
              {documentsData?.data.documents.find((d) => d.type === "NIN")
                ? "Document uploaded"
                : "No NIN document uploaded yet"}
            </Paragraph1>
          </div>
        </div>

        <div className="sm:self-center">
          <VerificationBadge status={ninStatus} />
        </div>
      </div>

      {/* NIN Upload Controls */}
      <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
        <Paragraph1 className="mb-2 text-sm font-medium text-gray-900">
          Upload NIN Document
        </Paragraph1>
        <Paragraph1 className="mb-3 text-xs text-gray-600">
          Accepted formats: JPEG, PNG. Maximum size 5MB.
        </Paragraph1>
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              NIN Number (optional)
            </Paragraph1>
            <input
              type="text"
              value={ninNumber}
              onChange={(e) => setNinNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="Enter NIN number"
            />
          </div>
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              NIN Document
            </Paragraph1>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleNinFileChange}
              className="w-full text-xs text-gray-700"
            />
          </div>
        </div>
        {ninError && (
          <Paragraph1 className="mb-2 text-xs text-red-600">
            {ninError}
          </Paragraph1>
        )}
        <button
          type="button"
          onClick={handleUploadNin}
          disabled={uploadNinMutation.isPending}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadNinMutation.isPending ? "Uploading..." : "Upload NIN"}
        </button>
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
            value={bvnData?.data.bvn.maskedValue || ""}
            placeholder={
              bvnData?.data.bvn.maskedValue ? "BVN on file" : "No BVN added yet"
            }
            readOnly
            className="w-full outline-none  text-lg tracking-wider text-gray-700 font-mono"
          />

          <VerificationBadge status={bvnStatus} />
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
        {/* Full Name (from profile.emergencyContact.name) */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Full Name
          </Paragraph1>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={emergencyForm.fullName}
              placeholder="Not provided yet"
              onChange={(e) =>
                handleEmergencyChange("fullName", e.target.value)
              }
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Email Address (managed via verifications emergency-contact endpoint) */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Email Address
          </Paragraph1>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={emergencyForm.email}
              placeholder="Enter emergency contact email"
              onChange={(e) => handleEmergencyChange("email", e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Phone (from profile.emergencyContact.phoneNumber) */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </Paragraph1>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={emergencyForm.phone}
              placeholder="Not provided yet"
              onChange={(e) => handleEmergencyChange("phone", e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Relationship (from profile.emergencyContact.relationship) */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Relationship
          </Paragraph1>
          <div className="relative">
            <HiOutlineUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={emergencyForm.relationship}
              placeholder="Not provided yet"
              onChange={(e) =>
                handleEmergencyChange("relationship", e.target.value)
              }
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Address (City, State)
        </Paragraph1>
        <div className="relative">
          <HiOutlineHome className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={emergencyAddress}
            placeholder="Not provided yet"
            readOnly
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-6">
        <button
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          disabled={updateEmergencyContactMutation.isPending}
          onClick={() => {
            updateEmergencyContactMutation.mutate({
              fullName: emergencyForm.fullName,
              email: emergencyForm.email,
              phone: emergencyForm.phone,
              relationship: emergencyForm.relationship,
            });
          }}
        >
          {updateEmergencyContactMutation.isPending
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AccountVerificationsForm;
