import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlinePlus,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";
import { toast } from "sonner";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { buttonPrimary } from "@/common/ui/buttonClasses";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/renters/useProfile";
import {
  useUpdateVerificationDetails,
  useUploadIdDocument,
  useVerificationsStatus,
} from "@/lib/queries/renters/useVerifications";
import {
  FUND_WALLET_ID_TYPE_OPTIONS,
  getFundWalletIdInputConfig,
  isFundWalletIdNumberComplete,
  normalizeFundWalletIdType,
  sanitizeFundWalletIdInput,
  validateFundWalletIdNumber,
} from "@/lib/renters/fundWalletIdUpload";

// Sub-component for displaying a verification status on a document or field
const VerificationBadge: React.FC<{
  status: "Verified" | "Pending" | "Failed";
  verifiedLabel?: string;
}> = ({ status, verifiedLabel = "Verified" }) => {
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
  const label = status === "Verified" ? verifiedLabel : status;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
};

const AccountVerificationsForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const { data: statusData } = useVerificationsStatus();
  const updateVerificationMutation = useUpdateVerificationDetails();
  const uploadIdDocumentMutation = useUploadIdDocument();

  const emergencyContact = profile?.emergencyContact;

  const [emergencyForm, setEmergencyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    relationship: "",
    city: "",
    state: "",
  });

  // ✅ Sync emergency contact from profile on load
  useEffect(() => {
    if (emergencyContact) {
      setEmergencyForm({
        fullName: emergencyContact.name || "",
        email: emergencyContact.email || "",
        phone: emergencyContact.phoneNumber || emergencyContact.phone || "",
        relationship: emergencyContact.relationship || "",
        city: emergencyContact.city || "",
        state: emergencyContact.state || "",
      });
    }
  }, [emergencyContact]);

  useEffect(() => {
    if (!profile?.nin) return;
    if (normalizeFundWalletIdType(documentType) === "NIN") {
      setNinNumber(sanitizeFundWalletIdInput("NIN", profile.nin));
    }
  }, [profile?.nin, documentType]);

  const handleEmergencyChange = (
    field: keyof typeof emergencyForm,
    value: string,
  ) => {
    setEmergencyForm((prev) => ({ ...prev, [field]: value }));
  };

  const ninStatusRaw =
    statusData?.data?.verifications?.validId?.status ?? "not_verified";
  const mapStatus = (
    status: string | undefined,
  ): "Verified" | "Pending" | "Failed" => {
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
    // `not_verified` means "not yet verified / in review" — not a hard failure
    if (
      s === "pending" ||
      s === "processing" ||
      s === "in_review" ||
      s === "submitted" ||
      s === "not_verified"
    ) {
      return "Pending";
    }
    if (s === "failed" || s === "rejected" || s === "declined") {
      return "Failed";
    }
    return "Pending";
  };

  const ninStatus = mapStatus(ninStatusRaw);

  const [ninNumber, setNinNumber] = useState(profile?.nin || "");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>(
    FUND_WALLET_ID_TYPE_OPTIONS[0].value,
  );
  const [isDraggingNin, setIsDraggingNin] = useState(false);

  const inputConfig = useMemo(
    () => getFundWalletIdInputConfig(documentType),
    [documentType],
  );
  const canUploadId =
    isFundWalletIdNumberComplete(documentType, ninNumber) && ninFile !== null;

  const handleNinFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setNinFile(file);
    setNinError(null);
  };

  const handleNinDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingNin(true);
  };

  const handleNinDragLeave = () => {
    setIsDraggingNin(false);
  };

  const handleNinDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingNin(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setNinFile(file);
      setNinError(null);
    }
  };

  const handleUploadNin = async () => {
    if (!ninFile) {
      setNinError("Please select an ID document to upload.");
      return;
    }

    const idErr = validateFundWalletIdNumber(documentType, ninNumber);
    if (idErr) {
      setNinError(idErr);
      return;
    }

    setNinError(null);

    const formData = new FormData();
    formData.append("idDocument", ninFile, ninFile.name);
    formData.append("idType", normalizeFundWalletIdType(documentType));

    try {
      await Promise.all([
        updateVerificationMutation.mutateAsync({
          nin: ninNumber.trim(),
        }),
        uploadIdDocumentMutation.mutateAsync(formData),
      ]);
      toast.success("ID document uploaded successfully!");
      setNinNumber("");
      setNinFile(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload ID document. Please try again.";
      toast.error(message);
      setNinError(message);
    }
  };
  if (isLoading && !profile) {
    return (
      <div className="font-sans w-full">
        <Paragraph1 className="mb-6 font-bold text-gray-900 text-lg">
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
      <Paragraph1 className="mb-6 font-bold text-gray-900 text-lg">
        Verifications
      </Paragraph1>

      {/* Identification Section */}
      <div
        className="flex flex-wrap justify-between items-center gap-2 mb-4"
        data-onboarding-target="renter-id-section"
      >
        <Paragraph1 className="text-gray-900 text-lg">
          Identification
        </Paragraph1>
        <VerificationBadge status={ninStatus} verifiedLabel="Uploaded" />
      </div>

      {ninStatus !== "Verified" ? (
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
              htmlFor="renter-id-document-type"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Document type
            </label>
            <select
              id="renter-id-document-type"
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value);
                setNinNumber("");
                setNinError(null);
              }}
              disabled={uploadIdDocumentMutation.isPending}
              className="w-full max-w-lg rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ID document type"
            >
              {FUND_WALLET_ID_TYPE_OPTIONS.map((opt) => (
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
                inputMode={inputConfig.inputMode}
                value={ninNumber}
                onChange={(e) =>
                  setNinNumber(
                    sanitizeFundWalletIdInput(documentType, e.target.value),
                  )
                }
                maxLength={inputConfig.maxLength}
                autoComplete="off"
                spellCheck={false}
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
              {/* Dropbox-style file upload area */}
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
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadIdDocumentMutation.isPending}
                  />
                  {uploadIdDocumentMutation.isPending ? (
                    <>
                      <Paragraph1 className="text-sm text-blue-600 font-medium">
                        ⏳ Uploading...
                      </Paragraph1>
                    </>
                  ) : ninFile ? (
                    <>
                      <Paragraph1 className="text-sm text-green-600 font-medium">
                        ✓ {ninFile.name}
                      </Paragraph1>
                      <Paragraph1 className="text-xs text-gray-500 mt-2">
                        {(ninFile.size / 1024 / 1024).toFixed(2)} MB
                      </Paragraph1>
                    </>
                  ) : (
                    <>
                      <HiOutlinePlus className="w-10 h-10 text-gray-400 mb-2" />
                      <Paragraph1 className="text-sm text-gray-600 font-medium">
                        Click to upload or drag file
                      </Paragraph1>
                      <Paragraph1 className="text-xs text-gray-400 mt-1">
                        PNG, JPEG or PDF • Max 5MB
                      </Paragraph1>
                    </>
                  )}
                </div>
              </div>
              {profile?.ninDocumentUrl && (
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
            disabled={uploadIdDocumentMutation.isPending || !canUploadId}
            className={`${buttonPrimary} mt-1 disabled:opacity-50`}
          >
            {uploadIdDocumentMutation.isPending ? "Uploading..." : "Upload ID"}
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
              ✓ Your ID has been uploaded
            </Paragraph1>
            <Paragraph1 className="mt-2 text-green-700 text-sm">
              Your identification document is on file. You can update your ID
              from settings if needed.
            </Paragraph1>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            City/LGA
          </Paragraph1>
          <CityLGASelect
            value={emergencyForm.city}
            onChange={(city) => handleEmergencyChange("city", city)}
          />
        </div>
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            State
          </Paragraph1>
          <StateSelect
            value={emergencyForm.state}
            onChange={(state) => handleEmergencyChange("state", state)}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 pb-6">
        <button
          className={buttonPrimary}
          type="button"
          disabled={updateVerificationMutation.isPending}
          onClick={() => {
            if (!emergencyForm.fullName.trim() || !emergencyForm.phone.trim()) {
              toast.error("Please fill in name and phone number");
              return;
            }

            updateVerificationMutation.mutate(
              {
                emergencyContact: {
                  name: emergencyForm.fullName,
                  phoneNumber: emergencyForm.phone,
                  email: emergencyForm.email,
                  relationship: emergencyForm.relationship,
                  city: emergencyForm.city,
                  state: emergencyForm.state,
                },
              },
              {
                onSuccess: () => {
                  toast.success("Emergency contact saved successfully!");
                },
                onError: (error: any) => {
                  toast.error(
                    error?.message || "Failed to save emergency contact",
                  );
                },
              },
            );
          }}
        >
          {updateVerificationMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AccountVerificationsForm;
