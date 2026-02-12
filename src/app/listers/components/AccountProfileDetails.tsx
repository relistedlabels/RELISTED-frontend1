// ENDPOINTS: GET /api/listers/profile, PUT /api/listers/profile, GET /api/listers/profile/addresses, POST /api/listers/profile/addresses, POST /api/listers/profile/avatar

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlineCamera,
  HiOutlinePlus,
} from "react-icons/hi2";
import { HiOutlineMail } from "react-icons/hi";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useUpdateListerProfile } from "@/lib/mutations/listers/useUpdateListerProfile";
import { uploadListerAvatar } from "@/lib/api/listers";

const AccountProfileDetails: React.FC = () => {
  const { data: profileResponse } = useListerProfile();
  const updateProfileMutation = useUpdateListerProfile();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // ✅ Local form state synced from store
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    defaultAddress: "",
  });

  // ✅ Sync store data to form on mount/store change
  useEffect(() => {
    const profile = profileResponse?.data.profile;
    if (profile) {
      const defaultAddress = profile.addresses?.find((a) => a.isDefault);
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        role: profile.role || "LISTER",
        defaultAddress: defaultAddress?.street || "",
      });
    }
  }, [profileResponse]);

  // ✅ Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // No local store sync here; we rely on server profile + form state
  };

  const handleUpdateProfile = () => {
    const profile = profileResponse?.data.profile;
    if (!profile) return;

    updateProfileMutation.mutate(
      {
        fullName: formData.fullName || profile.fullName,
        phone: formData.phone || profile.phone,
      },
      {
        onSuccess: () => {
          setUpdateStatus("success");
          setTimeout(() => setUpdateStatus("idle"), 3000);
        },
        onError: () => {
          setUpdateStatus("error");
          setTimeout(() => setUpdateStatus("idle"), 3000);
        },
      },
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);
    setIsUploadingAvatar(true);
    try {
      await uploadListerAvatar(formDataUpload);
      setUpdateStatus("success");
      setTimeout(() => setUpdateStatus("idle"), 3000);
    } catch {
      setUpdateStatus("error");
      setTimeout(() => setUpdateStatus("idle"), 3000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="font-sans">
      {/* Profile Header and Image Upload */}
      <div className="flex flex-col bg-[#3A3A32] p-6 items-center mb-6 rounded-lg">
        <div className="relative w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {/* Profile Picture or Placeholder (no avatar URL yet from API) */}
          <HiOutlineUser className="w-16 h-16 text-gray-500" />

          {/* Upload Button Overlay */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-gray-800 transition"
          >
            <HiOutlineCamera className="w-4 h-4 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <Paragraph1 className="text-sm text-center mt-4 text-white">
          {isUploadingAvatar
            ? "Uploading profile photo..."
            : "Upload a profile photo (Max 2MB)"}
        </Paragraph1>
      </div>

      {/* --- Profile Details Section --- */}
      <Paragraph1 className="text-lg font-bold uppercase text-gray-900 mb-4">
        Profile Details
      </Paragraph1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Full Name */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Full Name
          </Paragraph1>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="First Name Last Name"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition duration-150"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Email Address
          </Paragraph1>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition duration-150"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </Paragraph1>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition duration-150"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Role
          </Paragraph1>
          <div className="relative">
            <HiOutlineCube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.role}
              readOnly
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* --- Address Section --- */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Address
      </Paragraph1>
      <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
        Default Address
      </Paragraph1>

      <div className="flex items-start justify-between p-3 border border-gray-300 rounded-lg bg-white mb-6 gap-2">
        <div className="flex items-start space-x-2 flex-1">
          <HiOutlineHome className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <input
            type="text"
            value={formData.defaultAddress}
            onChange={(e) =>
              handleInputChange("defaultAddress", e.target.value)
            }
            placeholder="Enter your address"
            className="w-full text-sm text-gray-700 bg-transparent outline-none"
          />
        </div>
        <button
          type="button"
          className="text-gray-500 hover:text-black transition duration-150 p-1 shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-3 sm:flex-row justify-end pt-4">
        <button
          type="button"
          className="flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={updateProfileMutation.isPending}
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
        </button>
      </div>

      {updateStatus === "success" && (
        <Paragraph1 className="mt-3 text-sm text-green-600">
          Profile updated successfully.
        </Paragraph1>
      )}
      {updateStatus === "error" && (
        <Paragraph1 className="mt-3 text-sm text-red-600">
          Failed to update profile. Please try again.
        </Paragraph1>
      )}
    </div>
  );
};

export default AccountProfileDetails;
