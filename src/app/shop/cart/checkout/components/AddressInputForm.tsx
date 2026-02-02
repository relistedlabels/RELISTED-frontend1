"use client";

import React, { useState } from "react";
import { Header1, Paragraph1 } from "@/common/ui/Text";

export default function AddressInputForm() {
  const [address, setAddress] = useState({
    street: "01 Olusegun Street",
    city: "Iyana Ipaja",
    state: "Lagos State",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Placeholder data for the State dropdown
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
    "Lagos State", // Default selected state
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

  return (
    <div className="">
      <Paragraph1 className=" font-bold text-gray-800 tracking-wider mb-5">
        ADDRESS
      </Paragraph1>

      <form className="space-y-6">
        {/* Address Field */}
        <div>
          <label
            htmlFor="street"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            <Paragraph1>Address</Paragraph1>
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150  font-medium"
            placeholder="e.g., 01 Olusegun Street"
            required
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150  font-medium"
              placeholder="e.g., Iyana Ipaja"
              required
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
                className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150  font-medium pr-8 bg-white"
                required
              >
                {NigerianStates.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    <Paragraph1>{stateName}</Paragraph1>
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow to match the look in the image */}
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

        {/* Placeholder Button for Form Submission (Optional) */}
        {/* <button type="submit" className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors mt-6">
            Save Address
        </button> */}
      </form>
    </div>
  );
}
