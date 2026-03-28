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

  // ✅ Sync NIN and BVN when profile data loads
  useEffect(() => {
    if (profile) {
      console.log("🔄 Profile loaded, syncing NIN and BVN:", {
        nin: profile.nin,
        bvn: profile.bvn,
      });
      setNinNumber(profile.nin || "");
      setBvnNumber(profile.bvn || "");
    }
  }, [profile?.nin, profile?.bvn]);

  const handleEmergencyChange = (
    field: keyof typeof emergencyForm,
    value: string,
  ) => {
    setEmergencyForm((prev) => ({ ...prev, [field]: value }));
  };

  const ninStatusRaw =
    statusData?.data?.verifications?.validId?.status ?? "not_verified";
  const bvnStatusRaw =
    statusData?.data?.verifications?.bvn?.status ?? "not_verified";

  const mapStatus = (
    status: string | undefined,
  ): "Verified" | "Pending" | "Failed" => {
    const lower = (status || "").toLowerCase();
    if (lower === "verified") return "Verified";
    if (lower === "not_verified") return "Failed";
    if (lower === "pending") return "Pending";
    if (lower === "failed") return "Failed";
    return "Failed";
  };

  const ninStatus = mapStatus(ninStatusRaw);
  const bvnStatus = mapStatus(bvnStatusRaw);

  // Get overall verification status - only use BVN status
  const getOverallStatus = (): "Verified" | "Pending" | "Failed" => {
    return bvnStatus;
  };

  const verificationStatus = getOverallStatus();

  const [ninNumber, setNinNumber] = useState(profile?.nin || "");
  const [ninFile, setNinFile] = useState<File | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [isDraggingNin, setIsDraggingNin] = useState(false);

  const [bvnNumber, setBvnNumber] = useState(profile?.bvn || "");
  const [bvnError, setBvnError] = useState<string | null>(null);

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

  const handleUploadNin = () => {
    if (!ninFile) {
      setNinError("Please select an ID document to upload.");
      return;
    }

    if (!ninNumber.trim()) {
      setNinError("Please enter your ID number.");
      return;
    }

    if (ninNumber.trim().length !== 11 || !/^\d+$/.test(ninNumber.trim())) {
      setNinError("ID must be 11 digits.");
      return;
    }

    setNinError(null);
    console.log(
      "📤 Uploading ID document to POST /api/renters/profile/verifications/id-document",
    );

    const formData = new FormData();
    formData.append("document", ninFile);
    formData.append("ninNumber", ninNumber.trim());

    uploadIdDocumentMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("ID document uploaded successfully!");
        setNinNumber("");
        setNinFile(null);
      },
      onError: (error: any) => {
        toast.error(
          error?.message || "Failed to upload ID document. Please try again.",
        );
        setNinError(
          error?.message || "Failed to upload ID document. Please try again.",
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

      {/* ID Upload Controls - Hide when verified */}
      {verificationStatus !== "Verified" ? (
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
            disabled={uploadIdDocumentMutation.isPending}
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadIdDocumentMutation.isPending ? "Uploading..." : "Upload ID"}
          </button>
        </div>
      ) : (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
              <HiOutlineDocumentText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <Paragraph1 className="text-base font-semibold text-green-900">
              ✓ Your documents have been verified
            </Paragraph1>
            <Paragraph1 className="text-sm text-green-700 mt-2">
              All your identification documents have been successfully verified.
              Your account is now fully verified and you can access all platform
              features without restrictions.
            </Paragraph1>
          </div>
        </div>
      )}

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
                value={bvnNumber}
                onChange={(e) =>
                  setBvnNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder={
                  profile?.bvn
                    ? `Current: ${profile.bvn}`
                    : "Enter your 11-digit BVN"
                }
                maxLength={11}
                className="w-full outline-none text-lg tracking-wider text-gray-700 font-mono bg-white border border-gray-300 rounded-md px-3 py-2"
                disabled={updateVerificationMutation.isPending}
              />
              <button
                type="button"
                className="ml-0 md:ml-4 mt-2 md:mt-0 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={
                  updateVerificationMutation.isPending ||
                  !bvnNumber ||
                  bvnNumber.length !== 11
                }
                onClick={() => {
                  setBvnError(null);
                  if (!bvnNumber || bvnNumber.length !== 11) {
                    setBvnError("Please enter a valid 11-digit BVN.");
                    return;
                  }
                  updateVerificationMutation.mutate(
                    { bvn: bvnNumber },
                    {
                      onSuccess: () => {
                        toast.success("BVN submitted successfully!");
                        setBvnNumber("");
                      },
                      onError: (error: any) => {
                        toast.error(
                          error?.message ||
                            "Failed to submit BVN. Please try again.",
                        );
                        setBvnError(
                          error?.message ||
                            "Failed to submit BVN. Please try again.",
                        );
                      },
                    },
                  );
                }}
              >
                {updateVerificationMutation.isPending
                  ? "Submitting..."
                  : "Submit BVN"}
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
