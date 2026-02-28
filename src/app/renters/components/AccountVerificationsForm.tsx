// ENDPOINTS: GET /api/renters/verifications/status, POST /api/renters/verifications/id-document

import React, { useRef } from "react";
import {
  useVerificationsStatus,
  useUploadIdDocument,
} from "@/lib/queries/renters/useVerifications";

// Inline Spinner component (animated SVG)
const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-gray-400 mr-2" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const AccountVerificationsForm: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isPending, isError, error } = useVerificationsStatus();
  const uploadMutation = useUploadIdDocument();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("document", file);
      uploadMutation.mutate(formData);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner /> Loading verification status...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "Failed to load verifications."}
      </div>
    );
  }

  // Example data shape: { idStatus: "pending" | "verified" | "rejected", emailStatus: "verified" | "unverified" }
  const idStatus = data?.idStatus || "pending";
  const emailStatus = data?.emailStatus || "unverified";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold mb-2">Identity Verification</h2>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">🪪</span>
          </div>
          <div>
            <div className="font-semibold">Government ID</div>
            <div className="text-xs text-gray-500">Required for renting</div>
          </div>
        </div>
        <div className="mb-2">
          {idStatus === "verified" && (
            <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
              Verified
            </span>
          )}
          {idStatus === "pending" && (
            <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
              Pending
            </span>
          )}
          {idStatus === "rejected" && (
            <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-medium">
              Rejected
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold"
            onClick={handleUploadClick}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload ID"}
          </button>
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadMutation.isError && (
            <span className="text-xs text-red-500 ml-2">Upload failed</span>
          )}
          {uploadMutation.isSuccess && (
            <span className="text-xs text-green-600 ml-2">
              Upload successful
            </span>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold mb-2">Email Verification</h2>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
          <div>
            <div className="font-semibold">Email Address</div>
            <div className="text-xs text-gray-500">Used for notifications</div>
          </div>
        </div>
        <div className="mb-2">
          {emailStatus === "verified" ? (
            <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
              Verified
            </span>
          ) : (
            <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
              Unverified
            </span>
          )}
        </div>
        {/* TODO: Add resend verification logic if needed */}
      </div>
    </div>
  );
};

export default AccountVerificationsForm;
