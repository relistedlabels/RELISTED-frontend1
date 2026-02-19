"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useUpdateProfile } from "@/lib/mutations/user/useUpdateProfile";

const NigerianStates = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Ebonyi State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
  "Gombe State",
  "Imo State",
  "Jigawa State",
  "Kaduna State",
  "Kano State",
  "Katsina State",
  "Kebbi State",
  "Kogi State",
  "Kwara State",
  "Lagos State",
  "Nasarawa State",
  "Niger State",
  "Ogun State",
  "Ondo State",
  "Osun State",
  "Oyo State",
  "Plateau State",
  "Rivers State",
  "Sokoto State",
  "Taraba State",
  "Yobe State",
  "Zamfara State",
  "FCT Abuja",
];

export default function AddressInputForm() {
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
          <label
            htmlFor="street"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            <Paragraph1>Street Address</Paragraph1>
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 font-medium"
            placeholder="e.g., 01 Olusegun Street"
            required
            disabled={updateProfile.isPending}
          />
        </div>

        {/* City and State Fields (side-by-side) */}
        <div className="flex gap-4">
          {/* City Field */}
          <div className="flex-1">
            <label
              htmlFor="city"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              <Paragraph1>City</Paragraph1>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={address.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 font-medium"
              placeholder="e.g., Iyana Ipaja"
              required
              disabled={updateProfile.isPending}
            />
          </div>

          {/* State Field (Dropdown) */}
          <div className="flex-1">
            <label
              htmlFor="state"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              <Paragraph1>State</Paragraph1>
            </label>
            <div className="relative">
              <select
                id="state"
                name="state"
                value={address.state}
                onChange={handleInputChange}
                className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 font-medium pr-8 bg-white disabled:opacity-50"
                required
                disabled={updateProfile.isPending}
              >
                {NigerianStates.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
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
