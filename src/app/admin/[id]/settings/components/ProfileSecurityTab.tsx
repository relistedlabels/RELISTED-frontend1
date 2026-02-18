// ENDPOINTS: GET /api/admin/settings/profile, PUT /api/admin/settings/profile/password, PUT /api/admin/settings/profile/2fa, GET /api/admin/settings/profile/devices, POST /api/admin/settings/profile/logout-all-devices, PUT /api/admin/settings/profile/photo
"use client";

import { useState } from "react";
import { Edit2, Image, Trash2, Laptop, Smartphone, Save } from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton, TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminProfile, useDevices } from "@/lib/queries/admin/useSettings";
import {
  useUpdateAdminPassword,
  useUpdateAdminProfile,
} from "@/lib/mutations/admin";
import ChangePhotoModal from "./ChangePhotoModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileSecurityTab() {
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // API Queries
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useAdminProfile();
  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError,
  } = useDevices();

  // Extract profile info
  const profile = profileData?.data;
  const devices = devicesData?.data?.devices || [];

  // Log errors to console only
  if (profileError) {
    console.error("Failed to load profile:", profileError);
  }
  if (devicesError) {
    console.error("Failed to load devices:", devicesError);
  }

  // Show skeleton if loading or error
  const showSkeleton = profileLoading || !!profileError;

  return (
    <div>
      {/* Profile Information Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Paragraph3 className="text-gray-900 font-bold">
            Profile Information
          </Paragraph3>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50">
            <Save size={18} />
            <Paragraph1>Save Profile</Paragraph1>
          </button>
        </div>

        {showSkeleton ? (
          <FormSkeleton fields={4} />
        ) : (
          <>
            {/* Profile Photo Section */}
            <div className="mb-6">
              <Paragraph1 className="text-gray-600 font-medium mb-4">
                Profile Photo
              </Paragraph1>
              <div className="flex items-center gap-6">
                <img
                  src={profile?.avatar || "https://i.pravatar.cc/100?img=10"}
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
                  value={profile?.name || ""}
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
                  value={profile?.email || ""}
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
                  value={profile?.phone || ""}
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
                    {profile?.role || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
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
            disabled={showSkeleton}
            className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors disabled:opacity-50 ${
              profile?.status === "2fa_enabled" ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                profile?.status === "2fa_enabled"
                  ? "translate-x-7"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Logged-in Devices */}
        <div className="mb-6">
          <Paragraph1 className="text-gray-900 font-medium mb-4">
            Logged-in Devices
          </Paragraph1>
          {devicesLoading || devicesError ? (
            <TableSkeleton rows={3} columns={3} />
          ) : (
            <div className="space-y-3">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {device.type === "desktop" ? (
                        <Laptop size={20} className="text-gray-600" />
                      ) : (
                        <Smartphone size={20} className="text-gray-600" />
                      )}
                      <div>
                        <Paragraph1 className="text-gray-900 font-medium">
                          {device.name}{" "}
                          {device.isCurrent && (
                            <span className="text-green-600">(Current)</span>
                          )}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-500 text-sm">
                          {device.location} • {device.lastActive}
                        </Paragraph1>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Paragraph1 className="text-gray-500">
                  No devices found
                </Paragraph1>
              )}
            </div>
          )}
        </div>

        {/* Log Out All Devices */}
        <button
          disabled={showSkeleton}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
        >
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
