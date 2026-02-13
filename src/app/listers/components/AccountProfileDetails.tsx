// ENDPOINTS: GET /api/listers/profile, PUT /api/listers/profile, GET /api/listers/profile/addresses, POST /api/listers/profile/addresses, POST /api/listers/profile/avatar

"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlineCamera,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiOutlineMail } from "react-icons/hi";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useListerAddresses } from "@/lib/queries/listers/useListerAddresses";
import { useUpdateListerProfile } from "@/lib/mutations/listers/useUpdateListerProfile";
import { useAddListerAddress } from "@/lib/mutations/listers/useAddListerAddress";
import { useUpdateListerAddress } from "@/lib/mutations/listers/useUpdateListerAddress";
import { uploadListerAvatar, type AddAddressPayload } from "@/lib/api/listers";
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";

const AccountProfileDetails: React.FC = () => {
  const { data: profileResponse } = useListerProfile();
  const { data: addressesResponse } = useListerAddresses();
  const updateProfileMutation = useUpdateListerProfile();
  const addAddressMutation = useAddListerAddress();
  const updateAddressMutation = useUpdateListerAddress();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddAddressPayload>({
    type: "residential",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    isDefault: false,
  });
  const [addressError, setAddressError] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState<AddAddressPayload>({
    type: "residential",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    isDefault: false,
  });

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
    const addressesFromQuery = addressesResponse?.data.addresses;
    const addresses = addressesFromQuery ?? profile?.addresses ?? [];
    if (profile) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      const defaultAddressText = defaultAddress
        ? [
            defaultAddress.street,
            defaultAddress.city,
            defaultAddress.state,
            defaultAddress.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "";
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        role: profile.role || "LISTER",
        defaultAddress: defaultAddressText,
      });
    }
  }, [profileResponse, addressesResponse]);

  const addressesList = addressesResponse?.data.addresses ?? [];
  const primaryAddress =
    addressesList.find((address) => address.isDefault) ||
    addressesList[0] ||
    null;

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

  const handleNewAddressChange = (
    field: keyof AddAddressPayload,
    value: string | boolean,
  ) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAddress: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setAddressError(null);

    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.country
    ) {
      setAddressError("Please fill in street, city, state, and country.");
      return;
    }

    addAddressMutation.mutate(newAddress, {
      onSuccess: () => {
        setIsAddingAddress(false);
        setNewAddress({
          type: "residential",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Nigeria",
          isDefault: false,
        });
      },
      onError: () => {
        setAddressError("Failed to add address. Please try again.");
      },
    });
  };

  const handleOpenEditModal = (address: any) => {
    setEditingAddressId(address.addressId);
    setEditAddress({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setAddressError(null);
  };

  const handleEditAddressChange = (
    field: keyof AddAddressPayload,
    value: string | boolean,
  ) => {
    setEditAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateAddress: React.FormEventHandler<HTMLFormElement> = (
    event,
  ) => {
    event.preventDefault();
    setAddressError(null);

    if (
      !editAddress.street ||
      !editAddress.city ||
      !editAddress.state ||
      !editAddress.country
    ) {
      setAddressError("Please fill in street, city, state, and country.");
      return;
    }

    if (!editingAddressId) return;

    updateAddressMutation.mutate(
      {
        addressId: editingAddressId,
        data: editAddress,
      },
      {
        onSuccess: () => {
          setEditingAddressId(null);
          setUpdateStatus("success");
          setTimeout(() => setUpdateStatus("idle"), 3000);
        },
        onError: () => {
          setAddressError("Failed to update address. Please try again.");
        },
      },
    );
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

      {/* Default Address broken into fields */}
      <div className="mb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              Street
            </Paragraph1>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
              <HiOutlineHome className="h-4 w-4 text-gray-500" />
              <span className="truncate">
                {primaryAddress?.street || "No default address set"}
              </span>
            </div>
          </div>
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              City
            </Paragraph1>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {primaryAddress?.city ?? "-"}
            </div>
          </div>
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              State
            </Paragraph1>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {primaryAddress?.state ?? "-"}
            </div>
          </div>
          <div>
            <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
              Country
            </Paragraph1>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {primaryAddress?.country ?? "-"}
            </div>
          </div>
        </div>
        {primaryAddress && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleOpenEditModal(primaryAddress)}
              className="flex items-center gap-2 p-2 text-gray-500 hover:text-black transition"
              aria-label="Edit default address"
            >
              <HiOutlinePencil className="w-4 h-4" />
              <span className="text-xs font-medium">Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved addresses list - only show if more than one address */}
      {addressesList.length > 1 && (
        <div className="mb-6 space-y-2">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            Saved Addresses
          </Paragraph1>
          {addressesList.map((address) => (
            <div
              key={address.addressId}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <span className="font-medium">Street: </span>
                  <span>{address.street}</span>
                </div>
                <div>
                  <span className="font-medium">City: </span>
                  <span>{address.city}</span>
                </div>
                <div>
                  <span className="font-medium">State: </span>
                  <span>{address.state}</span>
                </div>
                <div>
                  <span className="font-medium">Country: </span>
                  <span>{address.country || "-"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:self-center">
                {address.isDefault && (
                  <span className="rounded-full bg-black px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                    Default
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(address)}
                  className="p-2 text-gray-500 hover:text-black transition"
                  aria-label="Edit address"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col w-full gap-3 sm:flex-row justify-end pt-4">
        <button
          type="button"
          onClick={() => setIsAddingAddress((prev) => !prev)}
          className="flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>{isAddingAddress ? "Cancel" : "Add New Address"}</span>
        </button>

        <AnimatePresence>
          {isAddingAddress && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.form
                onSubmit={handleAddAddress}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-left shadow-xl"
                style={{ zIndex: 60 }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="absolute right-4 top-4 p-2 text-gray-500 hover:text-black focus:outline-none transition"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
                <Paragraph1 className="mb-3 text-lg font-bold text-gray-900 text-center">
                  New Address
                </Paragraph1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Type
                    </Paragraph1>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={newAddress.type}
                      onChange={(e) =>
                        handleNewAddressChange("type", e.target.value)
                      }
                    >
                      <option value="residential">Residential</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Street
                    </Paragraph1>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={newAddress.street}
                      onChange={(e) =>
                        handleNewAddressChange("street", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      City
                    </Paragraph1>
                    <CityLGASelect
                      value={newAddress.city}
                      onChange={(value) =>
                        handleNewAddressChange("city", value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      State
                    </Paragraph1>
                    <StateSelect
                      value={newAddress.state}
                      onChange={(value) =>
                        handleNewAddressChange("state", value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Postal Code
                    </Paragraph1>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        handleNewAddressChange("postalCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Country
                    </Paragraph1>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={newAddress.country}
                      onChange={(e) =>
                        handleNewAddressChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>
                <label className="mb-3 flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={Boolean(newAddress.isDefault)}
                    onChange={(e) =>
                      handleNewAddressChange("isDefault", e.target.checked)
                    }
                  />
                  <span>Set as default address</span>
                </label>

                {addressError && (
                  <Paragraph1 className="mb-2 text-xs text-red-600">
                    {addressError}
                  </Paragraph1>
                )}

                <button
                  type="submit"
                  disabled={addAddressMutation.isPending}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addAddressMutation.isPending
                    ? "Saving address..."
                    : "Save Address"}
                </button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Address Modal */}
        <AnimatePresence>
          {editingAddressId && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.form
                onSubmit={handleUpdateAddress}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-left shadow-xl"
                style={{ zIndex: 60 }}
              >
                <button
                  type="button"
                  onClick={() => setEditingAddressId(null)}
                  className="absolute right-4 top-4 p-2 text-gray-500 hover:text-black focus:outline-none transition"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
                <Paragraph1 className="mb-3 text-lg font-bold text-gray-900 text-center">
                  Edit Address
                </Paragraph1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Type
                    </Paragraph1>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={editAddress.type}
                      onChange={(e) =>
                        handleEditAddressChange("type", e.target.value)
                      }
                    >
                      <option value="residential">Residential</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Street
                    </Paragraph1>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={editAddress.street}
                      onChange={(e) =>
                        handleEditAddressChange("street", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      City
                    </Paragraph1>
                    <CityLGASelect
                      value={editAddress.city}
                      onChange={(value) =>
                        handleEditAddressChange("city", value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      State
                    </Paragraph1>
                    <StateSelect
                      value={editAddress.state}
                      onChange={(value) =>
                        handleEditAddressChange("state", value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Postal Code
                    </Paragraph1>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={editAddress.postalCode}
                      onChange={(e) =>
                        handleEditAddressChange("postalCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
                      Country
                    </Paragraph1>
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-600 cursor-not-allowed"
                      value={editAddress.country}
                    />
                  </div>
                </div>
                <label className="mb-3 flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={Boolean(editAddress.isDefault)}
                    onChange={(e) =>
                      handleEditAddressChange("isDefault", e.target.checked)
                    }
                  />
                  <span>Set as default address</span>
                </label>

                {addressError && (
                  <Paragraph1 className="mb-2 text-xs text-red-600">
                    {addressError}
                  </Paragraph1>
                )}

                <button
                  type="submit"
                  disabled={updateAddressMutation.isPending}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateAddressMutation.isPending
                    ? "Saving changes..."
                    : "Save Changes"}
                </button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
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
