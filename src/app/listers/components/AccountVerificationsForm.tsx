"use client";

// ENDPOINTS: GET /api/listers/verifications/status, GET /api/listers/verifications/documents,
// POST /api/listers/verifications/nin, GET /api/listers/verifications/bvn,
// PUT /api/listers/verifications/emergency-contact

import type React from "react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { useSubmitBvn } from "@/lib/mutations/listers";
import { useUpdateEmergencyContact } from "@/lib/mutations/listers/useUpdateEmergencyContact";
import { useUploadNinDocument } from "@/lib/mutations/listers/useUploadNinDocument";
import { useUpdateListerProfileMutation } from "@/lib/queries/listers/useUpdateListerProfileMutation";
import { useVerificationStatus } from "@/lib/queries/listers/useVerificationStatus";
import { useUpload } from "@/lib/queries/renters/useUpload";
import { useProfile } from "@/lib/queries/user/useProfile";
import type { ProfileEmergencyContact } from "@/types/profile";

const MAX_ID_FILE_MB = 5;

const ID_TYPE_OPTIONS = [
  { value: "NIN", label: "National ID (NIN)" },
  { value: "PASSPORT", label: "International passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence" },
] as const;

/** Map API verification strings to UI buckets (handles `approved`, etc.) */
function mapApiStatusToUI(
  status: string | undefined,
): "Verified" | "Pending" | "Failed" {
  const s = (status || "").toLowerCase().trim();
  if (!s) return "Pending";
  if (
    s === "verified" ||
    s === "approved" ||
    s === "success" ||
    s === "complete" ||
    s === "completed"
  ) {
    return "Verified";
  }
  if (
    s === "failed" ||
    s === "not_verified" ||
    s === "rejected" ||
    s === "declined"
  ) {
    return "Failed";
  }
  return "Pending";
}

function isAllowedIdFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const typeOk =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "application/pdf";
  const extOk =
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".pdf");
  return typeOk || extOk;
}

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

type EmergencyFormState = {
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
};

function emergencyFormFromContact(
  contact: ProfileEmergencyContact | undefined,
): EmergencyFormState {
  const ec = contact as ProfileEmergencyContact & { email?: string };
  return {
    fullName: ec?.name || "",
    email: ec?.email || "",
    phone: ec?.phoneNumber || "",
    relationship: ec?.relationship || "",
  };
}

/** Mounted with `key={profile.id}` so initial state matches server without useEffect. */
function EmergencyContactBlock({
  contact,
  updateEmergencyContactMutation,
}: {
  contact: ProfileEmergencyContact | undefined;
  updateEmergencyContactMutation: ReturnType<
    typeof useUpdateEmergencyContact
  >;
}) {
  const [emergencyForm, setEmergencyForm] = useState<EmergencyFormState>(() =>
    emergencyFormFromContact(contact),
  );

  const emergencyAddress = useMemo(() => {
    if (!contact) return "";
    const parts = [contact.city, contact.state].filter(Boolean);
    return parts.join(", ");
  }, [contact]);

  const handleEmergencyChange = (
    field: keyof EmergencyFormState,
    value: string,
  ) => {
    setEmergencyForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Paragraph1 className="mb-4 pt-4 border-gray-100 border-t font-bold text-gray-900 text-lg">
        Emergency Contact Information
      </Paragraph1>
      <Paragraph1 className="mb-4 text-gray-600 text-sm">
        Emergency contact details for your account
      </Paragraph1>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mb-8">
        <div>
          <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
            Full Name
          </Paragraph1>
          <div className="relative">
            <HiOutlineUser className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              value={emergencyForm.fullName}
              placeholder="Not provided yet"
              onChange={(e) =>
                handleEmergencyChange("fullName", e.target.value)
              }
              className="p-3 pl-10 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full"
            />
          </div>
        </div>

        <div>
          <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
            Email Address
          </Paragraph1>
          <div className="relative">
            <HiOutlineEnvelope className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="email"
              value={emergencyForm.email}
              placeholder="Enter emergency contact email"
              onChange={(e) => handleEmergencyChange("email", e.target.value)}
              className="p-3 pl-10 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full"
            />
          </div>
        </div>

        <div>
          <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
            Phone Number
          </Paragraph1>
          <div className="relative">
            <HiOutlinePhone className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="tel"
              value={emergencyForm.phone}
              placeholder="Not provided yet"
              onChange={(e) => handleEmergencyChange("phone", e.target.value)}
              className="p-3 pl-10 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full"
            />
          </div>
        </div>

        <div>
          <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
            Relationship
          </Paragraph1>
          <div className="relative">
            <HiOutlineUsers className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              value={emergencyForm.relationship}
              placeholder="Not provided yet"
              onChange={(e) =>
                handleEmergencyChange("relationship", e.target.value)
              }
              className="p-3 pl-10 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Address (City, State)
        </Paragraph1>
        <div className="relative">
          <HiOutlineHome className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            type="text"
            value={emergencyAddress}
            placeholder="Not provided yet"
            readOnly
            className="bg-gray-50 p-3 pl-10 border border-gray-300 rounded-lg w-full text-gray-700"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-6">
        <button
          className="bg-black hover:bg-gray-800 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
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
    </>
  );
}

const AccountVerificationsForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const { data: statusData } = useVerificationStatus();
  const updateEmergencyContactMutation = useUpdateEmergencyContact();
  const uploadNinMutation = useUploadNinDocument();
  const uploadMutation = useUpload();
  const submitBvnMutation = useSubmitBvn();
  const updateProfileMutation = useUpdateListerProfileMutation();

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [ninNumber, setNinNumber] = useState("");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>(ID_TYPE_OPTIONS[0].value);
  const [isDraggingNin, setIsDraggingNin] = useState(false);

  const [bvnInput, setBvnInput] = useState("");
  const [bvnError, setBvnError] = useState<string | null>(null);

  const listerIdStatusRaw =
    statusData?.data?.verifications?.validId?.status ??
    statusData?.data?.verifications?.nin?.status;

  const idVerificationStatus = mapApiStatusToUI(listerIdStatusRaw);

  const bvnVerificationStatus = mapApiStatusToUI(
    statusData?.data?.verifications?.bvn?.status,
  );

  // Overall: failed if any tracked check failed; pending if any not verified; else verified
  const getOverallStatus = (): "Verified" | "Pending" | "Failed" => {
    if (!statusData?.data?.verifications) return "Pending";

    const v = statusData.data.verifications;
    const idStatus =
      v.validId?.status ?? v.nin?.status;
    const buckets = [
      mapApiStatusToUI(idStatus),
      mapApiStatusToUI(v.bvn?.status),
      v.businessRegistration?.status
        ? mapApiStatusToUI(v.businessRegistration.status)
        : null,
    ].filter(Boolean) as ("Verified" | "Pending" | "Failed")[];

    if (buckets.some((b) => b === "Failed")) return "Failed";
    if (buckets.some((b) => b !== "Verified")) return "Pending";
    return "Verified";
  };

  const verificationStatus = getOverallStatus();

  const assignIdFile = (file: File | null) => {
    if (!file) {
      setNinFile(null);
      return;
    }
    if (!isAllowedIdFile(file)) {
      setNinError("Please use a PNG, JPEG, or PDF file.");
      return;
    }
    if (file.size > MAX_ID_FILE_MB * 1024 * 1024) {
      setNinError(`File must be ${MAX_ID_FILE_MB}MB or smaller.`);
      return;
    }
    setNinFile(file);
    setNinError(null);
  };

  const handleNinFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    assignIdFile(file);
  };

  const handleNinDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingNin(true);
  };

  const handleNinDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingNin(false);
  };

  const handleNinDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingNin(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    assignIdFile(file);
  };

  const handleUploadNin = async () => {
    if (!ninFile) {
      setNinError("Please select a document to upload.");
      return;
    }

    const trimmedId = ninNumber.trim();
    if (!trimmedId) {
      setNinError("Please enter your ID number.");
      return;
    }

    setNinError(null);
    setIsUploadingFile(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", ninFile);
      const uploadResponse = await uploadMutation.mutateAsync(uploadFormData);
      const id =
        uploadResponse.id ||
        uploadResponse.data?.uploadId ||
        uploadResponse.data?.id;

      if (!id) {
        throw new Error("No upload ID received");
      }

      await updateProfileMutation.mutateAsync({
        nin: trimmedId,
      });

      await uploadNinMutation.mutateAsync({
        uploadId: id,
        idType: documentType,
      });

      setNinFile(null);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload document.";
      setNinError(message || "Failed to upload document. Please try again.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const idUploadBusy =
    uploadNinMutation.isPending ||
    isUploadingFile ||
    updateProfileMutation.isPending;

  if (isLoading && !profile) {
    return (
      <div className="w-full font-sans">
        <Paragraph1 className="mb-6 font-bold uppercase">
          Verifications
        </Paragraph1>
        <Paragraph1 className="text-gray-500 text-sm">
          Loading verification details...
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <div className="flex justify-between items-center">
        <Paragraph1 className="mb-6 font-bold uppercase">
          Verifications
        </Paragraph1>
        <div className="sm:self-center">
          <VerificationBadge status={verificationStatus} />
        </div>
      </div>

      {/* Identification Section */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <Paragraph1 className="text-gray-900 text-lg">
          Identification
        </Paragraph1>
        <VerificationBadge status={idVerificationStatus} />
      </div>

      {idVerificationStatus !== "Verified" ? (
        <div className="bg-gray-50 mb-6 p-4 border border-gray-300 border-dashed rounded-lg">
          <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
            {profile?.nin ? "Edit ID Information" : "Upload ID Document"}
          </Paragraph1>
          <Paragraph1 className="mb-3 text-gray-600 text-xs">
            {profile?.nin
              ? "Update your ID number or upload a new document"
              : "Accepted formats: JPEG, PNG, or PDF. Maximum size 5MB."}
          </Paragraph1>
          <div className="mb-4">
            <label
              htmlFor="lister-id-document-type"
              className="block mb-1 font-medium text-gray-700 text-xs"
            >
              Document type
            </label>
            <select
              id="lister-id-document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={idUploadBusy}
              className="bg-white disabled:opacity-50 px-3 py-2.5 border border-gray-300 focus:border-black rounded-md focus:outline-none focus:ring-1 focus:ring-black w-full max-w-lg text-gray-900 text-sm disabled:cursor-not-allowed"
              aria-label="ID document type"
            >
              {ID_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-4 mb-3">
            <div>
              <Paragraph1 className="mb-1 font-medium text-gray-700 text-xs">
                ID Number
              </Paragraph1>
              <input
                type="text"
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full text-sm"
                placeholder="Enter ID number"
              />
              {profile?.nin && (
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  Current ID: {profile.nin}
                </Paragraph1>
              )}
            </div>
            <div>
              <Paragraph1 className="mb-1 font-medium text-gray-700 text-xs">
                ID Document
              </Paragraph1>
              <div className="relative">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 py-12 bg-white transition cursor-pointer text-center flex flex-col items-center justify-center ${
                    isDraggingNin
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onDragOver={handleNinDragOver}
                  onDragLeave={handleNinDragLeave}
                  onDrop={handleNinDrop}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleNinFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    disabled={idUploadBusy}
                  />
                  {idUploadBusy ? (
                    <Paragraph1 className="font-medium text-blue-600 text-sm">
                      ⏳ Uploading...
                    </Paragraph1>
                  ) : ninFile ? (
                    <>
                      <Paragraph1 className="font-medium text-green-600 text-sm">
                        ✓ {ninFile.name}
                      </Paragraph1>
                      <Paragraph1 className="mt-2 text-gray-500 text-xs">
                        {(ninFile.size / 1024 / 1024).toFixed(2)} MB
                      </Paragraph1>
                    </>
                  ) : (
                    <>
                      <HiOutlinePlus className="mb-2 w-10 h-10 text-gray-400" />
                      <Paragraph1 className="font-medium text-gray-600 text-sm">
                        Click to upload or drag file
                      </Paragraph1>
                      <Paragraph1 className="mt-1 text-gray-400 text-xs">
                        PNG, JPEG or PDF • Max 5MB
                      </Paragraph1>
                    </>
                  )}
                </div>
              </div>
              {profile?.ninUploadId && (
                <Paragraph1 className="mt-1 text-green-600 text-xs">
                  ✓ Document already uploaded
                </Paragraph1>
              )}
            </div>
          </div>
          {ninError && (
            <Paragraph1 className="mb-2 text-red-600 text-xs">
              {ninError}
            </Paragraph1>
          )}
          <button
            type="button"
            onClick={handleUploadNin}
            disabled={idUploadBusy}
            className="inline-flex justify-center items-center bg-black hover:bg-gray-800 disabled:opacity-50 mt-1 px-4 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
          >
            {idUploadBusy ? "Uploading..." : "Upload ID"}
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 mb-6 p-6 border border-green-200 rounded-lg">
          <div className="shrink-0">
            <div className="flex justify-center items-center bg-green-100 rounded-lg w-12 h-12">
              <HiOutlineDocumentText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <Paragraph1 className="font-semibold text-green-900 text-base">
              ✓ Your ID has been verified
            </Paragraph1>
            <Paragraph1 className="mt-2 text-green-700 text-sm">
              Your identification document is verified. You can still update your
              ID from settings if needed.
            </Paragraph1>
          </div>
        </div>
      )}

      {/* Bank Verification */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <Paragraph1 className="font-bold text-gray-900 text-lg">
          Bank Verification Number
        </Paragraph1>
        <VerificationBadge status={bvnVerificationStatus} />
      </div>

      {verificationStatus !== "Verified" && (
        <div className="bg-amber-50 mb-4 p-4 border border-amber-300 rounded-lg">
          <Paragraph1 className="font-medium text-amber-900 text-sm">
            ⚠️ Important: Add your correct BVN
          </Paragraph1>
          <Paragraph1 className="mt-2 text-amber-800 text-xs">
            A correct BVN is essential for your account. Without it, you will:
          </Paragraph1>
          <ul className="space-y-1 mt-2 ml-4 text-amber-800 text-xs list-disc">
            <li>Not be able to make purchases on the platform</li>
            <li>Experience delays in the verification process</li>
            <li>Have limited access to platform features</li>
          </ul>
          <Paragraph1 className="mt-2 text-amber-800 text-xs">
            Please ensure you provide a valid and accurate BVN to proceed.
          </Paragraph1>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Paragraph1 className="text-gray-900 text-base">
            {profile?.bvn ? "Update BVN" : "Bank Verification Number (BVN)"}
          </Paragraph1>
        </div>
        <div className="flex md:flex-row flex-col justify-between items-center gap-2 bg-gray-50 p-4 border border-gray-300 rounded-lg">
          {bvnVerificationStatus === "Verified" ? (
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
                  className="bg-gray-50 outline-none w-full font-mono text-gray-700 text-lg tracking-wider"
                />
                {profile?.bvn && (
                  <Paragraph1 className="mt-2 text-gray-500 text-xs">
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
                className="bg-white px-3 py-2 border border-gray-300 rounded-md outline-none w-full font-mono text-gray-700 text-lg tracking-wider"
                disabled={submitBvnMutation.isPending}
              />
              <button
                type="button"
                className="bg-black hover:bg-gray-800 disabled:opacity-50 mt-2 md:mt-0 ml-0 md:ml-4 px-4 py-2 rounded-lg font-semibold text-white text-sm whitespace-nowrap transition disabled:cursor-not-allowed"
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
          <Paragraph1 className="mt-2 text-red-600 text-xs">
            {bvnError}
          </Paragraph1>
        )}
        <Paragraph1 className="mt-2 text-gray-500 text-xs">
          Your BVN is encrypted and secure. Only the last 4 digits are shown.
        </Paragraph1>
      </div>

      {profile && (
        <EmergencyContactBlock
          key={profile.id}
          contact={profile.emergencyContact}
          updateEmergencyContactMutation={updateEmergencyContactMutation}
        />
      )}
    </div>
  );
};

export default AccountVerificationsForm;
