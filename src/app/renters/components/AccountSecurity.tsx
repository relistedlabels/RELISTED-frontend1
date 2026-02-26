// ENDPOINTS: POST /api/renters/security/password

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineEye, HiEyeSlash } from "react-icons/hi2";

// Sub-component for a single password input field
interface PasswordInputProps {
  label: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  showPassword?: boolean;
  onToggleVisibility?: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  id,
  value,
  onChange,
  showPassword = false,
  onToggleVisibility,
}) => (
  <div className="mb-4">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-900 mb-2 block"
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
      />
      {/* Eye icon to toggle visibility */}
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150"
        aria-label={`${showPassword ? "Hide" : "Show"} ${label}`}
      >
        {showPassword ? (
          <HiEyeSlash className="w-5 h-5" />
        ) : (
          <HiOutlineEye className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

const AccountSecurity: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!formData.newPassword) {
      setError("New password is required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    // TODO: Connect to useChangePassword mutation when API endpoint is available
    setIsSubmitting(true);
    try {
      // Placeholder for mutation call
      // const changePasswordMutation = useChangePassword();
      // await changePasswordMutation.mutateAsync({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword,
      // });

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="font-sans ">
      <Paragraph1 className="text-xl uppercase font-bold text-gray-900 mb-6">
        Security
      </Paragraph1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <PasswordInput
          id="current-password"
          label="Current password"
          placeholder="Enter your current password"
          value={formData.currentPassword}
          onChange={(value) => handleChange("currentPassword", value)}
          showPassword={showPasswords.current}
          onToggleVisibility={() => togglePasswordVisibility("current")}
        />

        {/* New Password */}
        <PasswordInput
          id="new-password"
          label="New password"
          placeholder="Enter your new password"
          value={formData.newPassword}
          onChange={(value) => handleChange("newPassword", value)}
          showPassword={showPasswords.new}
          onToggleVisibility={() => togglePasswordVisibility("new")}
        />

        {/* Complexity Requirement */}
        <Paragraph1 className="text-xs text-gray-500 mt-1 mb-4">
          Must be at least 8 characters
        </Paragraph1>

        {/* Confirm New Password */}
        <PasswordInput
          id="confirm-password"
          label="Confirm New password"
          placeholder="Re-enter your new password"
          value={formData.confirmPassword}
          onChange={(value) => handleChange("confirmPassword", value)}
          showPassword={showPasswords.confirm}
          onToggleVisibility={() => togglePasswordVisibility("confirm")}
        />

        {/* Error Message */}
        {error && (
          <Paragraph1 className="text-red-600 text-sm">{error}</Paragraph1>
        )}

        {/* Success Message */}
        {success && (
          <Paragraph1 className="text-green-600 text-sm">
            Password changed successfully!
          </Paragraph1>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-150"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSecurity;
