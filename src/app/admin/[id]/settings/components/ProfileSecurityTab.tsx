// ENDPOINTS: GET /api/admin/settings/profile, PUT /api/admin/settings/profile/password, PUT /api/admin/settings/profile/2fa, GET /api/admin/settings/profile/devices, POST /api/admin/settings/profile/logout-all-devices, PUT /api/admin/settings/profile/photo
"use client";

import { useState } from "react";
import { Edit2, Image, Trash2, Laptop, Smartphone, Save } from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import ChangePhotoModal from "./ChangePhotoModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileSecurityTab() {
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <div>
      {/* Profile Information Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Paragraph3 className="text-gray-900 font-bold">
            Profile Information
          </Paragraph3>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
            <Save size={18} />
            <Paragraph1>Save Profile</Paragraph1>
          </button>
        </div>

        {/* Profile Photo Section */}
        <div className="  mb-6">
          <Paragraph1 className="text-gray-600 font-medium mb-4">
            Profile Photo
          </Paragraph1>
          <div className="flex items-center gap-6">
            <img
              src="https://i.pravatar.cc/100?img=10"
              alt="Profile"
              className="w-24 h-24 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsChangePhotoOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2"
              >
                <Image size={18} />
                <Paragraph1>Change Photo</Paragraph1>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2">
                <Trash2 size={18} />
                <Paragraph1>Remove</Paragraph1>
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Paragraph1 className="text-gray-600 font-medium mb-2">
              Full Name
            </Paragraph1>
            <input
              type="text"
              value="Jane Graham"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <Paragraph1 className="text-gray-600 font-medium mb-2">
              Email Address
            </Paragraph1>
            <input
              type="email"
              value="admin@relisted.com"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <Paragraph1 className="text-gray-600 font-medium mb-2">
              Phone Number (Optional)
            </Paragraph1>
            <input
              type="tel"
              value="+234 801 234 5678"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <Paragraph1 className="text-gray-600 font-medium mb-2">
              Role
            </Paragraph1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-gray-900 text-white rounded text-xs font-medium">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="border-t border-gray-200 pt-8">
        <Paragraph2 className="text-gray-900 mb-6">Security</Paragraph2>

        {/* Change Password */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 flex items-center justify-between">
          <div>
            <Paragraph1 className="text-gray-900 font-medium">
              Change Password
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              Update your password for security
            </Paragraph1>
          </div>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium whitespace-nowrap"
          >
            <Paragraph1>Update Password</Paragraph1>
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 flex items-center justify-between">
          <div>
            <Paragraph1 className="text-gray-900 font-medium">
              Two-Factor Authentication
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm">
              Add an extra layer of security to your account
            </Paragraph1>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
              twoFactorEnabled ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Logged-in Devices */}
        <div className="mb-6">
          <Paragraph1 className="text-gray-900 font-medium mb-4">
            Logged-in Devices
          </Paragraph1>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Laptop size={20} className="text-gray-600" />
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    MacBook Pro 16"{" "}
                    <span className="text-green-600">(Current)</span>
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Lagos, Nigeria • 2 days ago
                  </Paragraph1>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone size={20} className="text-gray-600" />
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    iPhone 14 Pro
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm">
                    Lagos, Nigeria • 1 hour ago
                  </Paragraph1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log Out All Devices */}
        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
          <Paragraph1>Log Out All Devices</Paragraph1>
        </button>
      </div>

      {/* Modals */}
      <ChangePhotoModal
        isOpen={isChangePhotoOpen}
        onClose={() => setIsChangePhotoOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
