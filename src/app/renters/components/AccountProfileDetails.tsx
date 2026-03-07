// ENDPOINTS: GET /api/renters/profile, PUT /api/renters/profile, GET /api/renters/profile/addresses, POST /api/renters/profile/addresses, POST /api/renters/profile/avatar

"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";
import { toast } from "sonner";

const AccountProfileDetails: React.FC = () => {
  const queryClient = useQueryClient();

  // ✅ API Queries
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfileDetails();
  const { data: addressesResponse, isLoading: isAddressesLoading } =
    useProfileAddresses();
  const updateProfileMutation = useUpdateProfile();
  const addAddressMutation = useAddProfileAddress();
  const uploadAvatarMutation = useUploadProfileAvatar();

  // ✅ Extract profile data from GET /api/renters/profile (nested in data.profile)
  console.log("🔍 Full profileResponse:", profileResponse);
  console.log("🔍 profileResponse?.profile:", profileResponse?.profile);
  const profileData = profileResponse?.profile; // Hook returns response.data which has {profile: {...}}
  console.log("📌 Extracted profileData:", profileData);
  console.log("⚠️ Profile Error:", profileError);

  // ✅ Extract addresses from GET /api/renters/profile/addresses
  const addresses = addressesResponse?.data?.addresses || [];

  // ✅ Extract avatar from GET /api/renters/profile (profileImage in profile data)
  const profileImageUrl = profileData?.profileImage;

  // ✅ Local form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // ✅ Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    type: "residential",
    isDefault: false,
  });

  // ✅ Sync profile data to form on load
  useEffect(() => {
    console.log("🔄 useEffect triggered, profileData:", profileData);
    if (profileData) {
      console.log("✅ Setting formData with:", {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
      });
      setFormData({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        role: profileData.role || "Renter",
      });
    } else {
      console.warn("⚠️ No profileData available");
    }
  }, [profileData]);

  // ✅ Load avatar from profile data
  useEffect(() => {
    if (profileImageUrl) {
      console.log("🖼️ Avatar URL loaded from profile:", profileImageUrl);
      setAvatarPreview(profileImageUrl);
    }
  }, [profileImageUrl]);

  // ✅ Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Handle update profile - uses PUT /api/renters/profile
  const handleUpdateProfile = () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateProfileMutation.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          // Invalidate profile query to refetch automatically
          queryClient.invalidateQueries({
            queryKey: ["renter-profile-details"],
          });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update profile");
        },
      },
    );
  };

  // ✅ Handle add address - uses POST /api/renters/profile/addresses
  const handleAddAddress = () => {
    if (
      !addressFormData.street.trim() ||
      !addressFormData.city.trim() ||
      !addressFormData.state.trim()
    ) {
      toast.error("Please fill in street, city, and state fields");
      return;
    }

    addAddressMutation.mutate(
      {
        type: addressFormData.type,
        street: addressFormData.street,
        city: addressFormData.city,
        state: addressFormData.state,
        postalCode: addressFormData.postalCode,
        country: addressFormData.country,
        isDefault: addressFormData.isDefault,
      },
      {
        onSuccess: () => {
          toast.success("Address added successfully!");
          // Invalidate addresses query to refetch automatically
          queryClient.invalidateQueries({
            queryKey: ["renter-profile-addresses"],
          });
          setIsAddressModalOpen(false);
          setAddressFormData({
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Nigeria",
            type: "residential",
            isDefault: false,
          });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to add address");
        },
      },
    );
  };

  // ✅ Handle avatar upload - uses POST /api/renters/profile/avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("avatar", file);

      uploadAvatarMutation.mutate(formData, {
        onSuccess: (response) => {
          console.log("✅ Avatar uploaded:", response.data);
          toast.success("Profile photo updated successfully!");
          // Refetch profile query since profileImage is in the profile response
          queryClient.invalidateQueries({
            queryKey: ["renter-profile-details"],
          });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to upload avatar");
        },
      });
    }
  };

  return (
    <div className="font-sans">
      {/* Profile Header and Image Upload */}
      <div className="flex flex-col bg-[#3A3A32] p-6 items-center mb-6 rounded-lg">
        <div className="relative w-28 h-28 flex items-center justify-center overflow-hidden ">
          {/* Avatar from profileImage in GET /api/renters/profile, uploaded to POST /api/renters/profile/avatar */}
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <HiOutlineUser className="w-16 h-16 text-gray-500" />
          )}

          {/* Upload Button Overlay - uses POST /api/renters/profile/avatar */}
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-gray-800 transition">
            <HiOutlineCamera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadAvatarMutation.isPending}
            />
          </label>
        </div>
        <Paragraph1 className="text-sm text-center mt-4 text-white">
          Upload a profile photo <br /> (Max 2MB)
        </Paragraph1>
        {uploadAvatarMutation.isPending && (
          <Paragraph1 className="text-xs text-gray-300 mt-2">
            Uploading...
          </Paragraph1>
        )}
      </div>

      {/* --- Profile Details Section --- */}
      <Paragraph1 className="text-lg font-bold uppercase text-gray-900 mb-4">
        Profile Details
      </Paragraph1>

      {/* DEBUG: Show form state */}
      {/* <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-900">
        <p>📊 Form State: {JSON.stringify(formData)}</p>
        <p>📊 ProfileData: {JSON.stringify(profileData)}</p>
      </div> */}

      {isProfileLoading ? (
        <Paragraph1 className="text-gray-600">Loading profile...</Paragraph1>
      ) : (
        <>
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
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
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
                  disabled
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
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
        </>
      )}

      {/* --- Address Section --- */}
      <Paragraph1 className="text-lg font-bold text-gray-900 mb-4">
        Addresses
      </Paragraph1>
      {isAddressesLoading ? (
        <Paragraph1 className="text-gray-600">Loading addresses...</Paragraph1>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {addresses.length > 0 ? (
              addresses.map((address: any) => (
                <div
                  key={address.id}
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
              ))
            ) : (
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center">
                  <HiOutlineHome className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <Paragraph1 className="text-gray-500 text-sm font-medium">
                    No addresses added yet
                  </Paragraph1>
                  <Paragraph1 className="text-gray-400 text-xs mt-1">
                    Click "Add New Address" to get started
                  </Paragraph1>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-3 sm:flex-row justify-end pt-4">
        <button
          type="button"
          className="flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
          onClick={() => setIsAddressModalOpen(true)}
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={updateProfileMutation.isPending || isProfileLoading}
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

      {/* --- Address Modal --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Add New Address
            </h2>

            <div className="space-y-4">
              {/* Street */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1 block">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={addressFormData.street}
                  onChange={(e) =>
                    setAddressFormData({
                      ...addressFormData,
                      street: e.target.value,
                    })
                  }
                  placeholder="e.g., 123 Main Street"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                />
              </div>

              <div className=" grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    City *
                  </label>
                  <CityLGASelect
                    value={addressFormData.city}
                    onChange={(value) =>
                      setAddressFormData({
                        ...addressFormData,
                        city: value,
                      })
                    }
                  />
                </div>
                {/* State */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-1 block">
                    State *
                  </label>
                  <StateSelect
                    value={addressFormData.state}
                    onChange={(value) =>
                      setAddressFormData({
                        ...addressFormData,
                        state: value,
                      })
                    }
                  />
                </div>{" "}
              </div>

              {/* Postal Code */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1 block">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={addressFormData.postalCode}
                  onChange={(e) =>
                    setAddressFormData({
                      ...addressFormData,
                      postalCode: e.target.value,
                    })
                  }
                  placeholder="e.g., 100001"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                />
              </div>

              {/* Address Type */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1 block">
                  Address Type
                </label>
                <select
                  value={addressFormData.type}
                  onChange={(e) =>
                    setAddressFormData({
                      ...addressFormData,
                      type: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) =>
                    setAddressFormData({
                      ...addressFormData,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-black cursor-pointer"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Set as default address
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAddress}
                disabled={addAddressMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {addAddressMutation.isPending ? "Adding..." : "Add Address"}
              </button>
            </div>

            {addAddressMutation.isError && (
              <Paragraph1 className="text-red-600 text-sm mt-3">
                Error:{" "}
                {(addAddressMutation.error as any)?.message ||
                  "Failed to add address"}
              </Paragraph1>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfileDetails;
