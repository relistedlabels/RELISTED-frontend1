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
import {
  useProfileDetails,
  useUpdateProfile,
  useProfileAddresses,
  useAddProfileAddress,
  useUploadProfileAvatar,
} from "@/lib/queries/renters/useProfileDetails";
import { FullProfile } from "@/types/profile";

const AccountProfileDetails: React.FC = () => {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  // ✅ Fetch profile from API
  const { data, isLoading } = useProfileDetails();
  const updateProfileMutation = useUpdateProfile();
  const { data: addressesData, isLoading: isAddressesLoading } =
    useProfileAddresses();
  const addAddressMutation = useAddProfileAddress();
  const uploadAvatarMutation = useUploadProfileAvatar();

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
    if (data?.data?.profile) {
      const p = data.data.profile;
      setFormData({
        fullName: p.fullName || "",
        email: p.email || "",
        phone: p.phone || "",
        role: p.role || "Renter",
        defaultAddress:
          p.addresses?.find((a: any) => a.isDefault)?.street || "",
      });
    }
  }, [data]);

  // ✅ Sync store data to form as fallback
  if (!data?.data?.profile && profile) {
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
        <div className="relative w-28 h-28   flex items-center justify-center overflow-hidden">
          {/* Profile Picture or Placeholder */}
          {data?.data?.profile?.profileImage ? (
            <img
              src={data.data.profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <HiOutlineUser className="w-16 h-16 text-gray-500" />
          )}

          {/* Upload Button Overlay */}
          <form>
            <label className="absolute  bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-gray-800 transition">
              <HiOutlineCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    const formData = new FormData();
                    formData.append("avatar", e.target.files[0]);
                    uploadAvatarMutation.mutate(formData);
                  }
                }}
              />
            </label>
          </form>
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
        Addresses
      </Paragraph1>
      {isAddressesLoading ? (
        <Paragraph1>Loading addresses...</Paragraph1>
      ) : (
        <div className="space-y-2 mb-6">
          {(addressesData?.data?.addresses || []).map((address: any) => (
            <div
              key={address.addressId}
              className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
            >
              <div className="flex items-start space-x-2 flex-1">
                <HiOutlineHome className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {address.street}, {address.city}, {address.state}
                </span>
                {address.isDefault && (
                  <span className="ml-2 px-2 py-1 text-xs bg-black text-white rounded">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-3 sm:flex-row justify-end pt-4">
        <button
          type="button"
          className="flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
          onClick={() => {
            const street = prompt("Enter new address street:");
            if (street) {
              addAddressMutation.mutate({
                type: "residential",
                street,
                city: "Lagos",
                state: "Lagos",
                postalCode: "100001",
                country: "Nigeria",
                isDefault: false,
              });
            }
          }}
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
