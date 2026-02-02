import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
// Importing icons needed for the form fields
import { MapPin, ChevronDown } from "lucide-react";
import { FileUploader } from "@/common/ui/FileUploader";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProfileStore } from "@/store/useProfileStore";
import { PhoneInput } from "./PhoneInput";

// Define props for the component
interface StepOnePersonalProps {
  onNext: () => void; // Function passed down from the flow to advance the step
}

const StepOnePersonal: React.FC<StepOnePersonalProps> = ({ onNext }) => {
  // State for all form fields (initialize from profile store when available)
  const profile = useProfileStore((s) => s);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");
  const [address, setAddress] = useState(profile.address?.street || "");
  const [city, setCity] = useState(profile.address?.city || "");
  const [state, setState] = useState(profile.address?.state || "");
  const [identificationFiles, setIdentificationFiles] = useState<File[]>([]);
  const setProfile = useProfileStore((s) => s.setProfile);

  useEffect(() => {
    setPhoneNumber(profile.phoneNumber || "+234");
    setAddress(profile.address?.street || "");
    setCity(profile.address?.city || "");
    setState(profile.address?.state || "");
  }, [
    profile.phoneNumber,
    profile.address?.street,
    profile.address?.city,
    profile.address?.state,
  ]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !address || !city || !state) {
      alert("Please fill in all required fields.");
      return;
    }

    setProfile({
      phoneNumber,
      address: {
        street: address,
        city,
        state,
        country: "Nigeria",
      },
    });

    onNext();
  };

  const handleUpload = (data: { id: string; url?: string }) => {
    setIdentificationFiles((s) => s);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* 1. Phone Number Input */}
      <div className="">
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Phone Number
            </Paragraph1>
            <ToolInfo content="Your primary contact number used for verification and notifications." />
          </div>
        </label>
        <PhoneInput
          value={phoneNumber}
          onChange={(val) => setPhoneNumber(val)}
        />
      </div>
      {/* 2. Address Input */}
      <div>
        <label htmlFor="address" className="block mb-2">
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
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black"
          />
        </div>
      </div>
      {/* 3. City and State (Side-by-side) */}
      <div className="flex space-x-4">
        {/* City Input */}
        <div className="flex-1">
          <label htmlFor="city" className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                City
              </Paragraph1>
              <ToolInfo content="City or local government area of residence." />
            </div>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter City"
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-white text-gray-600 placeholder-gray-400 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* State Dropdown */}
        <div className="flex-1">
          <label htmlFor="state" className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                State
              </Paragraph1>
              <ToolInfo content="State of residence used for compliance and regional services." />
            </div>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              id="state"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full appearance-none p-4 pl-12 pr-10 border border-gray-300 rounded-lg bg-white text-gray-600 focus:ring-black focus:border-black"
            >
              <option value="" disabled>
                Select State
              </option>
              {/* Example options */}
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja FCT</option>
              <option value="Rivers">Rivers</option>
            </select>
            {/* Custom chevron icon to override default select appearance */}
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      {/* Means of Identification (optional) - removed BVN & ID requirements per request */}
      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Means of Identification
            </Paragraph1>
            <ToolInfo content="Optional: upload passport, driver's license or national ID to speed up verification." />
          </div>
        </label>
        <FileUploader
          helperText="International Passport, NIN, Driver's License"
          onUploaded={handleUpload}
        />

        {identificationFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <Paragraph1>
              Files selected:{" "}
              {identificationFiles.map((f) => f.name).join(", ")}
            </Paragraph1>
          </div>
        )}
      </div>
      {/* Next Button */}
      <button
        type="submit"
        className="w-full py-3 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 mt-8"
      >
        <Paragraph1>Next</Paragraph1>
      </button>
    </form>
  );
};

export default StepOnePersonal;
