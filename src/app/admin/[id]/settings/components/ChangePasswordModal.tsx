"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import OtpConfirmationModal from "./OtpConfirmationModal";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Show OTP modal
    setShowOtp(true);
  };

  const handleOtpConfirm = () => {
    console.log("Password changed successfully");
    setShowOtp(false);
    onClose();
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Paragraph2 className="text-gray-900">Change Password</Paragraph2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Paragraph1 className="text-red-700 text-sm">
                  {error}
                </Paragraph1>
              </div>
            )}

            {/* Current Password */}
            <div className="mb-4">
              <Paragraph1 className="text-gray-600 font-medium mb-2">
                Current Password
              </Paragraph1>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* New Password */}
            <div className="mb-4">
              <Paragraph1 className="text-gray-600 font-medium mb-2">
                New Password
              </Paragraph1>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <Paragraph1 className="text-gray-600 font-medium mb-2">
                Confirm Password
              </Paragraph1>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
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
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                <Paragraph1>Continue</Paragraph1>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Confirmation Modal */}
      <OtpConfirmationModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onConfirm={handleOtpConfirm}
      />
    </>
  );
}
