"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import { useProfile } from "@/lib/queries/renters/useProfile";
import {
  useUpdateVerificationDetails,
  useUploadIdDocument,
} from "@/lib/queries/renters/useVerifications";
import {
  FUND_WALLET_ID_TYPE_OPTIONS,
  getFundWalletIdInputConfig,
  isFundWalletIdNumberComplete,
  normalizeFundWalletIdType,
  sanitizeFundWalletIdInput,
  validateFundWalletIdNumber,
} from "@/lib/renters/fundWalletIdUpload";

type FundWalletIdUploadProps = {
  onUploaded?: () => void;
};

export default function FundWalletIdUpload({ onUploaded }: FundWalletIdUploadProps) {
  const { data: profile } = useProfile();
  const updateVerificationMutation = useUpdateVerificationDetails();
  const uploadIdDocumentMutation = useUploadIdDocument();

  const [documentType, setDocumentType] = useState<string>(
    FUND_WALLET_ID_TYPE_OPTIONS[0].value,
  );
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputConfig = useMemo(
    () => getFundWalletIdInputConfig(documentType),
    [documentType],
  );

  const idNumberComplete = isFundWalletIdNumberComplete(documentType, idNumber);
  const canUpload = idNumberComplete && idFile !== null;

  useEffect(() => {
    if (!profile?.nin) return;
    if (normalizeFundWalletIdType(documentType) === "NIN") {
      setIdNumber(sanitizeFundWalletIdInput("NIN", profile.nin));
    }
  }, [profile?.nin, documentType]);

  const isUploading =
    uploadIdDocumentMutation.isPending || updateVerificationMutation.isPending;

  const handleDocumentTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextType = event.target.value;
    setDocumentType(nextType);
    setIdNumber("");
    setError(null);
  };

  const handleIdNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIdNumber(
      sanitizeFundWalletIdInput(documentType, event.target.value),
    );
    setError(null);
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setIdFile(file);
    setError(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setIdFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!idFile) {
      setError("Please select an ID document to upload.");
      return;
    }

    const idErr = validateFundWalletIdNumber(documentType, idNumber);
    if (idErr) {
      setError(idErr);
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("idDocument", idFile, idFile.name);
    formData.append("idType", normalizeFundWalletIdType(documentType));

    try {
      await Promise.all([
        updateVerificationMutation.mutateAsync({
          nin: idNumber.trim(),
        }),
        uploadIdDocumentMutation.mutateAsync(formData),
      ]);
      toast.success("ID uploaded. We will review it shortly.");
      setIdFile(null);
      onUploaded?.();
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload ID document. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="bg-gray-50 p-4 border border-gray-200 border-dashed rounded-xl">
      <Paragraph1 className="mb-1 font-semibold text-gray-900 text-sm">
        Verify your ID
      </Paragraph1>
      <Paragraph1 className="mb-2 text-gray-600 text-xs leading-relaxed">
        Required to fund your Relisted wallet.
      </Paragraph1>
      <Paragraph1 className="mb-4 text-gray-500 text-xs leading-relaxed">
         Accepted formats:
        JPEG, PNG, or PDF (max 5MB).
      </Paragraph1>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="fund-wallet-id-type"
            className="block mb-1 font-medium text-gray-700 text-xs"
          >
            Document type
          </label>
          <select
            id="fund-wallet-id-type"
            value={documentType}
            onChange={handleDocumentTypeChange}
            disabled={isUploading}
            className="bg-white disabled:opacity-50 px-3 py-2.5 border border-gray-300 focus:border-black rounded-md focus:outline-none focus:ring-1 focus:ring-black w-full text-gray-900 text-sm"
          >
            {FUND_WALLET_ID_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="fund-wallet-id-number"
            className="block mb-1 font-medium text-gray-700 text-xs"
          >
            ID number
          </label>
          <input
            id="fund-wallet-id-number"
            type="text"
            inputMode={inputConfig.inputMode}
            value={idNumber}
            onChange={handleIdNumberChange}
            disabled={isUploading}
            placeholder="Enter ID number"
            maxLength={inputConfig.maxLength}
            autoComplete="off"
            spellCheck={false}
            className="bg-white disabled:opacity-50 px-3 py-2.5 border border-gray-300 focus:border-black rounded-md focus:outline-none focus:ring-1 focus:ring-black w-full text-sm"
          />
        </div>

        <div>
          <Paragraph1 className="mb-1 font-medium text-gray-700 text-xs">
            ID document
          </Paragraph1>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 bg-white text-center transition ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            />
            {isUploading ? (
              <Paragraph1 className="font-medium text-blue-600 text-sm">
                Uploading...
              </Paragraph1>
            ) : idFile ? (
              <>
                <Paragraph1 className="font-medium text-green-600 text-sm">
                  {idFile.name}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  {(idFile.size / 1024 / 1024).toFixed(2)} MB
                </Paragraph1>
              </>
            ) : (
              <>
                <HiOutlinePlus className="mx-auto mb-2 w-8 h-8 text-gray-400" />
                <Paragraph1 className="font-medium text-gray-600 text-sm">
                  Click to upload or drag file
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-400 text-xs">
                  PNG, JPEG or PDF
                </Paragraph1>
              </>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <Paragraph1 className="mt-3 text-red-600 text-xs">{error}</Paragraph1>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isUploading || !canUpload}
        className={`${buttonPrimaryFull} mt-4 disabled:opacity-50`}
      >
        {isUploading ? "Uploading..." : "Upload ID"}
      </button>
    </div>
  );
}
