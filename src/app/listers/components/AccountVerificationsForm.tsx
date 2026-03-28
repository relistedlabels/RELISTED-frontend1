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
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4 pt-4 border-t border-gray-100">
        Emergency Contact Information
      </Paragraph1>
      <Paragraph1 className="text-sm text-gray-600 mb-4">
        Emergency contact details for your account
      </Paragraph1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
  /** Profile PUT for ID number during document flow */
  const updateProfileMutation = useUpdateListerProfileMutation();
  /** Separate mutation so BVN submit does not toggle ID upload loading state */
  const updateBvnMutation = useUpdateListerProfileMutation();

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
      await queryClient.invalidateQueries({
        queryKey: ["listers", "verifications", "status"],
      });
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
      <div className="flex justify-between items-center">
        <Paragraph1 className="mb-6 uppercase font-bold">
          Verifications
        </Paragraph1>
        <div className="sm:self-center">
          <VerificationBadge status={verificationStatus} />
        </div>
      </div>

      {/* Identification Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Paragraph1 className="text-lg text-gray-900">
          Identification
        </Paragraph1>
        <VerificationBadge status={idVerificationStatus} />
      </div>

      {idVerificationStatus !== "Verified" ? (
        <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
          <Paragraph1 className="mb-2 text-sm font-medium text-gray-900">
            {profile?.nin ? "Edit ID Information" : "Upload ID Document"}
          </Paragraph1>
          <Paragraph1 className="mb-3 text-xs text-gray-600">
            {profile?.nin
              ? "Update your ID number or upload a new document"
              : "Accepted formats: JPEG, PNG, or PDF. Maximum size 5MB."}
          </Paragraph1>
          <div className="mb-4">
            <label
              htmlFor="lister-id-document-type"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Document type
            </label>
            <select
              id="lister-id-document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={idUploadBusy}
              className="w-full max-w-lg rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ID document type"
            >
              {ID_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3 flex flex-col gap-4">
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
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    disabled={idUploadBusy}
                  />
                  {idUploadBusy ? (
                    <Paragraph1 className="text-sm font-medium text-blue-600">
                      ⏳ Uploading...
                    </Paragraph1>
                  ) : ninFile ? (
                    <>
                      <Paragraph1 className="text-sm font-medium text-green-600">
                        ✓ {ninFile.name}
                      </Paragraph1>
                      <Paragraph1 className="mt-2 text-xs text-gray-500">
                        {(ninFile.size / 1024 / 1024).toFixed(2)} MB
                      </Paragraph1>
                    </>
                  ) : (
                    <>
                      <HiOutlinePlus className="mb-2 h-10 w-10 text-gray-400" />
                      <Paragraph1 className="text-sm font-medium text-gray-600">
                        Click to upload or drag file
                      </Paragraph1>
                      <Paragraph1 className="mt-1 text-xs text-gray-400">
                        PNG, JPEG or PDF • Max 5MB
                      </Paragraph1>
                    </>
                  )}
                </div>
              </div>
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
            disabled={idUploadBusy}
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {idUploadBusy ? "Uploading..." : "Upload ID"}
          </button>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-4 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <HiOutlineDocumentText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <Paragraph1 className="text-base font-semibold text-green-900">
              ✓ Your ID has been verified
            </Paragraph1>
            <Paragraph1 className="mt-2 text-sm text-green-700">
              Your identification document is verified. You can still update your
              ID from settings if needed.
            </Paragraph1>
          </div>
        </div>
      )}

      {/* Bank Verification */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Paragraph1 className="text-lg font-bold text-gray-900">
          Bank Verification Number
        </Paragraph1>
        <VerificationBadge status={bvnVerificationStatus} />
      </div>

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
                disabled={updateBvnMutation.isPending}
              />
              <button
                type="button"
                className="ml-0 md:ml-4 mt-2 md:mt-0 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={
                  updateBvnMutation.isPending ||
                  !bvnInput ||
                  bvnInput.length !== 11
                }
                onClick={() => {
                  setBvnError(null);
                  if (!bvnInput || bvnInput.length !== 11) {
                    setBvnError("Please enter a valid 11-digit BVN.");
                    return;
                  }
                  updateBvnMutation.mutate(
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
                {updateBvnMutation.isPending ? "Submitting..." : "Submit BVN"}
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
