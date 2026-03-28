"use client";

// ENDPOINTS: GET /api/listers/verifications/status, GET /api/listers/verifications/documents,
// POST /api/listers/verifications/nin, GET /api/listers/verifications/bvn,
// PUT /api/listers/verifications/emergency-contact

import type React from "react";
import { useMemo, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { useUpdateEmergencyContact } from "@/lib/mutations/listers/useUpdateEmergencyContact";
import { useUploadNinDocument } from "@/lib/mutations/listers/useUploadNinDocument";
import { useSubmitBvn } from "@/lib/mutations/listers";
import { useVerificationDocuments } from "@/lib/queries/listers/useVerificationDocuments";
import { useVerificationStatus } from "@/lib/queries/listers/useVerificationStatus";
import { useProfile } from "@/lib/queries/user/useProfile";

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
  const updateEmergencyContactMutation = useUpdateEmergencyContact();
  const uploadNinMutation = useUploadNinDocument();
  const submitBvnMutation = useSubmitBvn();

  const emergencyContact = profile?.emergencyContact;

  const [emergencyForm, setEmergencyForm] = useState({
    fullName: emergencyContact?.name || "",
    email: "",
    phone: emergencyContact?.phoneNumber || "",
    relationship: emergencyContact?.relationship || "",
  });

  const [ninNumber, setNinNumber] = useState(profile?.nin || "");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);

  const [bvnInput, setBvnInput] = useState(profile?.bvn || "");
  const [bvnError, setBvnError] = useState<string | null>(null);

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

  // Get overall verification status - if any verification is not verified, account is not verified
  const getOverallStatus = (): "Verified" | "Pending" | "Failed" => {
    if (!statusData?.data?.verifications) return "Pending";

    const verifications = statusData.data.verifications;
    const statuses = [
      verifications.nin?.status,
      verifications.bvn?.status,
      verifications.businessRegistration?.status,
    ].map((s) => (s || "").toLowerCase());

    // If any is "failed", overall is failed
    if (statuses.some((s) => s === "failed" || s === "not_verified"))
      return "Failed";
    // If any is "pending", overall is pending
    if (statuses.some((s) => s === "pending")) return "Pending";
    // All verified
    return "Verified";
  };

  const verificationStatus = getOverallStatus();

  const handleNinFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setNinFile(file);
    setNinError(null);
  };

  const handleUploadNin = () => {
    if (!ninFile) {
      setNinError("Please select an ID document to upload.");
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
      <div className=" flex justify-between items-center"> 
        {" "}
        <Paragraph1 className="mb-6 uppercase font-bold">
          Verifications
        </Paragraph1>
        <div className="sm:self-center">
          <VerificationBadge status={verificationStatus} />
        </div>
      </div>

      {/* Identification Section */}
      <Paragraph1 className="text-lg text-gray-900 mb-4">
        Identification
      </Paragraph1>

      

      {/* ID Upload Controls */}
      <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
        <Paragraph1 className="mb-2 text-sm font-medium text-gray-900">
          {profile?.nin ? "Edit ID Information" : "Upload ID Document"}
        </Paragraph1>
        <Paragraph1 className="mb-3 text-xs text-gray-600">
          {profile?.nin
            ? "Update your ID number or upload a new document"
            : "Accepted formats: JPEG, PNG. Maximum size 5MB."}
        </Paragraph1>
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              ID Number
            </Paragraph1>
            <input
              type="text"
              value={ninNumber}
              onChange={(e) => setNinNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="Enter ID number"
            />
            {profile?.nin && (
              <Paragraph1 className="mt-1 text-xs text-gray-500">
                Current ID: {profile.nin}
              </Paragraph1>
            )}
          </div>
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              ID Document
            </Paragraph1>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleNinFileChange}
              className="w-full text-xs text-gray-700"
            />
            {profile?.ninUploadId && (
              <Paragraph1 className="mt-1 text-xs text-green-600">
                ✓ Document already uploaded
              </Paragraph1>
            )}
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
          {uploadNinMutation.isPending ? "Uploading..." : "Upload ID"}
        </button>
      </div>

      {/* Bank Verification */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Bank Verification Number
      </Paragraph1>

      {verificationStatus !== "Verified" && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <Paragraph1 className="text-sm text-amber-900 font-medium">
            ⚠️ Important: Add your correct BVN
          </Paragraph1>
          <Paragraph1 className="text-xs text-amber-800 mt-2">
            A correct BVN is essential for your account. Without it, you will:
          </Paragraph1>
          <ul className="text-xs text-amber-800 mt-2 ml-4 list-disc space-y-1">
            <li>Not be able to make purchases on the platform</li>
            <li>Experience delays in the verification process</li>
            <li>Have limited access to platform features</li>
          </ul>
          <Paragraph1 className="text-xs text-amber-800 mt-2">
            Please ensure you provide a valid and accurate BVN to proceed.
          </Paragraph1>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Paragraph1 className="text-base text-gray-900">
            {profile?.bvn ? "Update BVN" : "Bank Verification Number (BVN)"}
          </Paragraph1>
        </div>
        <div className="border bg-gray-50 border-gray-300 rounded-lg flex flex-col md:flex-row justify-between items-center p-4 gap-2">
          {/* If verification is verified, show masked value. If not verified, allow BVN input and submission */}
          {verificationStatus === "Verified" ? (
            <>
              <div className="w-full">
                <input
                  type="text"
                  value={
                    profile?.bvn
                      ? `${profile.bvn.slice(0, 4)}****${profile.bvn.slice(-3)}`
                      : "BVN Verified"
                  }
                  readOnly
                  className="w-full outline-none text-lg tracking-wider text-gray-700 font-mono bg-gray-50"
                />
                {profile?.bvn && (
                  <Paragraph1 className="text-xs text-gray-500 mt-2">
                    Your BVN is encrypted and secure. Only partial digits shown.
                  </Paragraph1>
                )}
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                value={bvnInput}
                onChange={(e) => setBvnInput(e.target.value.replace(/\D/g, ""))}
                placeholder={
                  profile?.bvn
                    ? `Current: ${profile.bvn}`
                    : "Enter your 11-digit BVN"
                }
                maxLength={11}
                className="w-full outline-none text-lg tracking-wider text-gray-700 font-mono bg-white border border-gray-300 rounded-md px-3 py-2"
                disabled={submitBvnMutation.isPending}
              />
              <button
                type="button"
                className="ml-0 md:ml-4 mt-2 md:mt-0 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={
                  submitBvnMutation.isPending ||
                  !bvnInput ||
                  bvnInput.length !== 11
                }
                onClick={() => {
                  setBvnError(null);
                  if (!bvnInput || bvnInput.length !== 11) {
                    setBvnError("Please enter a valid 11-digit BVN.");
                    return;
                  }
                  submitBvnMutation.mutate(
                    { bvn: bvnInput },
                    {
                      onSuccess: () => {
                        setBvnInput("");
                      },
                      onError: () => {
                        setBvnError("Failed to submit BVN. Please try again.");
                      },
                    },
                  );
                }}
              >
                {submitBvnMutation.isPending ? "Submitting..." : "Submit BVN"}
              </button>
            </>
          )}
         
        </div>
        {bvnError && (
          <Paragraph1 className="text-xs text-red-600 mt-2">
            {bvnError}
          </Paragraph1>
        )}
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
