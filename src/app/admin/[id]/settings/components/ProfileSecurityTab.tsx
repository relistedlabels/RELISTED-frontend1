// ENDPOINTS: GET /api/auth/me, GET /api/users/profile, PUT /api/admin/settings/profile/password, PUT /api/admin/settings/profile/2fa, GET /api/admin/settings/profile/devices, POST /api/admin/settings/profile/logout-all-devices, PUT /api/admin/settings/profile/photo
"use client";

import { useState, useEffect } from "react";
import { Edit2, Image, Laptop, Save, Loader2 } from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton, TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useDevices } from "@/lib/queries/admin/useSettings";
import {
  useUpdateAdminPassword,
  useLogoutAllDevices,
  useUpdateAdminProfile,
} from "@/lib/mutations/admin";
import ChangePhotoModal from "./ChangePhotoModal";
import ChangePasswordModal from "./ChangePasswordModal";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function ProfileSecurityTab() {
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isFormDirty, setIsFormDirty] = useState(false);

  // API Queries
  const { data: user, isLoading: userLoading, error: userError } = useMe();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError,
  } = useDevices();

  // API Mutations
  const logoutAllDevicesMutation = useLogoutAllDevices();
  const updateProfileMutation = useUpdateAdminProfile();

  // Initialize form data when user/profile loads
  useEffect(() => {
    if (user && profile) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: profile.phone || "",
      });
    }
  }, [user, profile]);

  // Extract devices array
  const devices = devicesData?.data || [];

  // Log errors to console only
  if (userError) {
    console.error("Failed to load user:", userError);
  }
  if (profileError) {
    console.error("Failed to load profile:", profileError);
  }
  if (devicesError) {
    console.error("Failed to load devices:", devicesError);
  }

  // Show skeleton if loading or error
  const showSkeleton =
    userLoading || profileLoading || !!userError || !!profileError;

  const handleLogoutAllDevices = async () => {
    try {
      await logoutAllDevicesMutation.mutateAsync(false);
      setIsLogoutConfirmOpen(false);
      // Redirect to login after successful logout
      window.location.href = "/admin/auth/login";
    } catch (error) {
      console.error("Error logging out all devices:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setIsFormDirty(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsFormDirty(true);
  };

  return (
    <div>
      {/* Profile Information Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Paragraph3 className="text-gray-900 font-bold">
            Profile Information
          </Paragraph3>
          <button
            onClick={handleSaveProfile}
            disabled={
              !isFormDirty || updateProfileMutation.isPending || showSkeleton
            }
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <Paragraph1>Saving...</Paragraph1>
              </>
            ) : (
              <>
                <Save size={18} />
                <Paragraph1>Save Profile</Paragraph1>
              </>
            )}
          </button>
        </div>

        {showSkeleton ? (
          <FormSkeleton fields={4} />
        ) : (
          <>
            {/* Profile Photo Section */}
            <div className="mb-6 hidden">
              <Paragraph1 className="text-gray-600 font-medium mb-4">
                Profile Photo
              </Paragraph1>
              <div className="flex items-center gap-6">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center">
                    <Paragraph1 className="text-gray-600">No Photo</Paragraph1>
                  </div>
                )}
                <button
                  onClick={() => setIsChangePhotoOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2"
                >
                  <Image size={18} />
                  <Paragraph1>Change Photo</Paragraph1>
                </button>
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
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Email Address
                </Paragraph1>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Role
                </Paragraph1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-900 text-white rounded text-xs font-medium uppercase">
                    {user?.role || "Unknown"}
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
                devices.map((device, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Laptop size={20} className="text-gray-600" />
                      <div>
                        <Paragraph1 className="text-gray-900 font-medium">
                          {device.device}{" "}
                          {device.current && (
                            <span className="text-green-600">(Current)</span>
                          )}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-500 text-sm">
                          {device.location}
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
          onClick={() => setIsLogoutConfirmOpen(true)}
          disabled={showSkeleton || logoutAllDevicesMutation.isPending}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {logoutAllDevicesMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <Paragraph1>Logging out...</Paragraph1>
            </>
          ) : (
            <Paragraph1>Log Out All Devices</Paragraph1>
          )}
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
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogoutAllDevices}
        isLoading={logoutAllDevicesMutation.isPending}
      />
    </div>
  );
}
