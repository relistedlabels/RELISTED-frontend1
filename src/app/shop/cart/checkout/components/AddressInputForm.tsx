"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import { MapPin } from "lucide-react";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { StateSelect } from "@/app/auth/profile-setup/components/StateSelect";
import { CityLGASelect } from "@/app/auth/profile-setup/components/CityLGASelect";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useUpdateProfile } from "@/lib/mutations/user/useUpdateProfile";

interface AddressInputFormProps {
  onClose?: () => void;
}

export default function AddressInputForm({ onClose }: AddressInputFormProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "Lagos State",
    country: "Nigeria",
    zipCode: "",
  });

  // Populate form with existing profile data
  useEffect(() => {
    if (profile?.address) {
      setAddress({
        street: profile.address.street || "",
        city: profile.address.city || "",
        state: profile.address.state || "Lagos State",
        country: profile.address.country || "Nigeria",
        zipCode: profile.address.zipCode || "",
      });
    }
  }, [profile]);

  // Close modal and refresh on successful save
  useEffect(() => {
    if (updateProfile.isSuccess) {
      onClose?.();
      router.refresh();
    }
  }, [updateProfile.isSuccess, onClose, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateProfile.mutate({
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
      },
    });
  };

  return (
    <div>
      <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-5">
        ADDRESS
      </Paragraph1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Field */}
        <div>
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                Address
              </Paragraph1>
              <ToolInfo content="Your residential address used for identity verification and deliveries." />
            </div>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="street"
              name="street"
              value={address.street}
              onChange={handleInputChange}
              className="w-full p-4 pl-12 border rounded-lg"
              placeholder="e.g., 01 Olusegun Street"
              required
              disabled={updateProfile.isPending}
            />
          </div>
        </div>

        {/* City and State Fields (side-by-side) */}
        <div className="flex gap-4">
          <CityLGASelect
            value={address.city}
            onChange={(value) =>
              setAddress((prev) => ({ ...prev, city: value }))
            }
          />
          <StateSelect
            value={address.state}
            onChange={(value) =>
              setAddress((prev) => ({ ...prev, state: value }))
            }
          />
        </div>

        {/* Postal Code Field */}
        <div>
          <label
            htmlFor="postal_code"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            <Paragraph1>Postal Code (Optional)</Paragraph1>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={address.zipCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 font-medium"
            placeholder="e.g., 100001"
            disabled={updateProfile.isPending}
          />
        </div>

        {/* Error Message */}
        {updateProfile.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <Paragraph1 className="text-xs text-red-700">
              {updateProfile.error?.message || "Failed to update address"}
            </Paragraph1>
          </div>
        )}

        {/* Success Message */}
        {updateProfile.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <Paragraph1 className="text-xs text-green-700">
              Address updated successfully!
            </Paragraph1>
          </div>
        )}

        {/* Submit Button (if needed within form) */}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Paragraph1>
            {updateProfile.isPending ? "Saving..." : "Save Address"}
          </Paragraph1>
        </button>
      </form>
    </div>
  );
}
