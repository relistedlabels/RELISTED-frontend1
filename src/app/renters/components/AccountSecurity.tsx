// ENDPOINTS: POST /api/renters/security/password

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineEye } from "react-icons/hi2";

// Sub-component for a single password input field
interface PasswordInputProps {
  label: string;
  placeholder: string;
  id: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  id,
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
        type="password"
        id={id}
        placeholder={placeholder}
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
      />
      {/* Eye icon to toggle visibility */}
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150"
        aria-label={`Show ${label}`}
      >
        <HiOutlineEye className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const AccountSecurity: React.FC = () => {
  return (
    <div className="font-sans ">
      <Paragraph1 className="text-xl uppercase font-bold text-gray-900 mb-6">
        Security
      </Paragraph1>

      <form className="space-y-4">
        {/* Current Password */}
        <PasswordInput
          id="current-password"
          label="Current password"
          placeholder="Enter your current password"
        />

        {/* New Password */}
        <PasswordInput
          id="new-password"
          label="New password"
          placeholder="Enter your new password"
        />

        {/* Complexity Requirement */}
        <Paragraph1 className="text-xs text-gray-500 mt-1 mb-4">
          Must be at least 8 characters with a mix of uppercase, lowercase,
          numbers, and symbols
        </Paragraph1>

        {/* Confirm New Password */}
        <PasswordInput
          id="confirm-password"
          label="Confirm New password"
          placeholder="Re-enter your new password"
        />

        {/* Action Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSecurity;
