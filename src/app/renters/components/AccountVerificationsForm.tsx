import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { toast } from "sonner";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/renters/useProfile";
import {
  useSubmitBvn,
  useUpdateVerificationDetails,
  useUploadIdDocument,
  useVerificationsStatus,
} from "@/lib/queries/renters/useVerifications";

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
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const { data: statusData } = useVerificationsStatus();
  const submitBvnMutation = useSubmitBvn();
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
      console.log(
        "🔄 Loading emergency contact from profile:",
        emergencyContact,
      );
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

  const handleEmergencyChange = (
    field: keyof typeof emergencyForm,
    value: string,
  ) => {
    setEmergencyForm((prev) => ({ ...prev, [field]: value }));
  };

  const ninStatusRaw =
    statusData?.data?.verifications?.nin?.status ?? "pending";
  const bvnStatusRaw =
    statusData?.data?.verifications?.bvn?.status ?? "pending";

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

  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("national_id");

  const [bvnNumber, setBvnNumber] = useState("");
  const [bvnError, setBvnError] = useState<string | null>(null);

  const handleNinFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setNinFile(file);
    setNinError(null);
  };

  const handleUploadNin = () => {
    if (!ninFile) {
      setNinError("Please select a document to upload.");
      return;
    }

    setNinError(null);

    const formData = new FormData();
    formData.append("idDocument", ninFile);
    formData.append("idType", documentType);

    uploadIdDocumentMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("ID document uploaded successfully!");
        setNinFile(null);
      },
      onError: (error: any) => {
        toast.error(
          error?.message || "Failed to upload NIN document. Please try again.",
        );
        setNinError(
          error?.message || "Failed to upload NIN document. Please try again.",
        );
      },
    });
  };

  const handleSubmitBvn = () => {
    if (!bvnNumber.trim()) {
      setBvnError("Please enter a BVN number.");
      return;
    }

    if (bvnNumber.trim().length !== 11 || !/^\d+$/.test(bvnNumber.trim())) {
      setBvnError("BVN must be 11 digits.");
      return;
    }

    setBvnError(null);
    console.log("📤 Submitting BVN to PUT /api/renters/profile:", bvnNumber);
    updateVerificationMutation.mutate(
      { bvn: bvnNumber.trim() },
      {
        onSuccess: () => {
          toast.success("BVN submitted successfully!");
          setBvnNumber("");
        },
        onError: (error: any) => {
          toast.error(
            error?.message || "Failed to submit BVN. Please try again.",
          );
          setBvnError(
            error?.message || "Failed to submit BVN. Please try again.",
          );
        },
      },
    );
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
              {profile?.ninDocumentUrl
                ? "Document uploaded"
                : "No NIN document uploaded yet"}
            </Paragraph1>
          </div>
        </div>

        <div className="sm:self-center">
          <VerificationBadge status={ninStatus} />
        </div>
      </div>

      {/* ID Upload Controls */}
      <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
        <Paragraph1 className="mb-2 text-sm font-medium text-gray-900">
          Upload ID Document
        </Paragraph1>
        <Paragraph1 className="mb-3 text-xs text-gray-600">
          Upload your ID document for verification. Accepted formats: JPEG, PNG,
          PDF. Maximum size 5MB.
        </Paragraph1>
        <div className="mb-3">
          <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
            Document Type
          </Paragraph1>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            <option value="national_id">National ID (NIN)</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>
        <div className="mb-3">
          <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
            Upload Document
          </Paragraph1>
          <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <Paragraph1 className="text-sm text-gray-500">
                {ninFile ? ninFile.name : "Click to upload or drag and drop"}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-400 mt-1">
                JPEG, PNG or PDF (max 5MB)
              </Paragraph1>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleNinFileChange}
              className="hidden"
            />
          </label>
        </div>
        {ninError && (
          <Paragraph1 className="mb-2 text-xs text-red-600">
            {ninError}
          </Paragraph1>
        )}
        <button
          type="button"
          onClick={handleUploadNin}
          disabled={uploadIdDocumentMutation.isPending || !ninFile}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadIdDocumentMutation.isPending ? "Uploading..." : "Upload ID"}
        </button>
      </div>

      {/* Bank Verification Section */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Bank Verification Number
      </Paragraph1>

      {!bvnNumber && bvnStatus === "Pending" && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <Paragraph1 className="text-sm text-amber-900 font-medium">
            ⚠️ Important: Provide your correct BVN
          </Paragraph1>
          <Paragraph1 className="text-xs text-amber-800 mt-2">
            Please ensure the BVN you enter is accurate and correct. An
            incorrect BVN will:
          </Paragraph1>
          <ul className="text-xs text-amber-800 mt-2 ml-4 list-disc space-y-1">
            <li>Prevent you from making purchases on the platform</li>
            <li>Hinder your account verification process</li>
            <li>Delay access to all platform features</li>
          </ul>
          <Paragraph1 className="text-xs text-amber-800 mt-2">
            Double-check your BVN before submitting to avoid these issues.
          </Paragraph1>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Paragraph1 className="text-base text-gray-900">BVN</Paragraph1>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={bvnNumber}
            onChange={(e) => setBvnNumber(e.target.value)}
            placeholder="Enter 11-digit BVN"
            className="flex-1 rounded-lg border border-gray-300 p-3 text-sm"
          />
          <VerificationBadge status={bvnStatus} />
        </div>
        {bvnError && (
          <Paragraph1 className="mt-2 text-xs text-red-600">
            {bvnError}
          </Paragraph1>
        )}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleSubmitBvn}
            disabled={updateVerificationMutation.isPending}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateVerificationMutation.isPending
              ? "Submitting..."
              : "Submit BVN"}
          </button>
        </div>
        <Paragraph1 className="text-xs text-gray-500 mt-2">
          Enter your 11-digit Bank Verification Number for verification
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

      {/* Address - City and State Selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* City/LGA */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            City/LGA
          </Paragraph1>
          <CityLGASelect
            value={emergencyForm.city}
            onChange={(city) => handleEmergencyChange("city", city)}
          />
        </div>

        {/* State */}
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

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-6">
        <button
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          disabled={updateVerificationMutation.isPending}
          onClick={() => {
            if (!emergencyForm.fullName.trim() || !emergencyForm.phone.trim()) {
              toast.error("Please fill in name and phone number");
              return;
            }

            console.log(
              "📤 Saving emergency contact to PUT /api/renters/profile:",
              emergencyForm,
            );
            updateVerificationMutation.mutate(
              {
                emergencyContact: {
                  name: emergencyForm.fullName,
                  phone: emergencyForm.phone,
                  email: emergencyForm.email,
                  relationship: emergencyForm.relationship,
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
