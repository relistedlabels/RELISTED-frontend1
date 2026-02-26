// ENDPOINTS: GET /api/renters/profile, PUT /api/renters/profile, GET /api/renters/profile/addresses, POST /api/renters/profile/addresses, POST /api/renters/profile/avatar

"use client";

import React, { useState, useEffect } from "react";
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
import { useProfileStore } from "@/store/profileStore";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useUpdateProfile } from "@/lib/mutations/renters/useProfileMutations";
import { FullProfile } from "@/types/profile";

const AccountProfileDetails: React.FC = () => {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  // ✅ Fetch profile from API
  const { data: apiProfile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // ✅ Local form state synced from store/API
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    defaultAddress: "",
  });

  // ✅ Sync API data to form on load
  useEffect(() => {
    if (apiProfile) {
      setFormData({
        fullName: apiProfile.fullName || "",
        email: apiProfile.email || "",
        phone: apiProfile.phone || "",
        role: profile?.role || "Renter",
        defaultAddress: profile?.address?.street || "",
      });
    }
  }, [apiProfile]);

  // ✅ Sync store data to form as fallback
  if (!apiProfile && profile) {
    useEffect(() => {
      setFormData({
        fullName: profile.firstName + " " + profile.lastName || "",
        email: profile.email || "",
        phone: profile.phoneNumber || "",
        role: profile.role || "Renter",
        defaultAddress: profile.address?.street || "",
      });
    }, [profile]);
  }

  // ✅ Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Handle update profile
  const handleUpdateProfile = () => {
    const [firstName, lastName] = formData.fullName.split(" ");

    updateProfileMutation.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone,
      },
      {
        onSuccess: () => {
          // Update store as fallback
          setProfile({
            ...profile,
            firstName: firstName || "",
            lastName: lastName || "",
            phoneNumber: formData.phone,
          } as FullProfile);
          alert("Profile updated successfully!");
        },
        onError: (error: any) => {
          alert(error?.message || "Failed to update profile");
        },
      },
    );
  };

  return (
    <div className="font-sans">
      {/* Profile Header and Image Upload */}
      <div className="flex flex-col bg-[#3A3A32] p-6 items-center mb-6 rounded-lg">
        <div className="relative w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {/* Profile Picture or Placeholder */}
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <HiOutlineUser className="w-16 h-16 text-gray-500" />
          )}

          {/* Upload Button Overlay */}
          <button
            type="button"
            className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-gray-800 transition"
          >
            <HiOutlineCamera className="w-4 h-4 text-white" />
          </button>
        </div>
        <Paragraph1 className="text-sm text-center mt-4 text-white">
          Upload a profile photo <br /> (Max 2MB)
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
          disabled={updateProfileMutation.isPending || isLoading}
          className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-150"
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
        </button>
      </div>

      {updateProfileMutation.isError && (
        <Paragraph1 className="text-red-600 text-sm mt-2">
          Error:{" "}
          {(updateProfileMutation.error as any)?.message ||
            "Failed to update profile"}
        </Paragraph1>
      )}
    </div>
  );
};

export default AccountProfileDetails;
