"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

interface OtpConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OtpConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: OtpConfirmationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      console.log("OTP verified:", otp);
      onConfirm();
      setOtp("");
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Paragraph2 className="text-gray-900">Verify with OTP</Paragraph2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <Paragraph1 className="text-gray-600 mb-6">
            Enter the 6-digit OTP sent to your registered email address.
          </Paragraph1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Paragraph1 className="text-red-700 text-sm">{error}</Paragraph1>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <Paragraph1 className="text-gray-600 font-medium mb-2">
              Enter OTP
            </Paragraph1>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Resend OTP */}
          <div className="text-center mb-6">
            <Paragraph1 className="text-gray-600 text-sm">
              Didn't receive OTP?{" "}
              <button className="text-gray-900 font-medium hover:underline">
                Resend
              </button>
            </Paragraph1>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Paragraph1>Cancel</Paragraph1>
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || !otp}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paragraph1>{loading ? "Verifying..." : "Verify OTP"}</Paragraph1>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
