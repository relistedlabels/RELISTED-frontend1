"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { User, Mail, Hash, MapPin, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { CityLGASelect } from "./CityLGASelect";
import { StateSelect } from "./StateSelect";
import { useRouter } from "next/navigation";
import { useCreateProfile } from "@/lib/queries/user/useCreateProfile";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { toast } from "sonner";

interface StepTwoBusinessDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

const StepTwoBusinessDetails: React.FC<StepTwoBusinessDetailsProps> = ({
  onNext,
  onBack,
}) => {
  const businessInfo = useProfileStore((s) => s.businessInfo);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [businessName, setBusinessName] = useState(businessInfo.businessName);
  const [businessEmail, setBusinessEmail] = useState(
    businessInfo.businessEmail,
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    businessInfo.businessRegistrationNumber,
  );
  const [address, setAddress] = useState(businessInfo.businessAddress);
  const [city, setCity] = useState(businessInfo.businessCity);
  const [state, setState] = useState(businessInfo.businessState);

  const router = useRouter();
  const createProfile = useCreateProfile();
  const isLoading = createProfile.isPending;

  useEffect(() => {
    setBusinessName(businessInfo.businessName || "");
    setBusinessEmail(businessInfo.businessEmail || "");
    setRegistrationNumber(businessInfo.businessRegistrationNumber || "");
    setAddress(businessInfo.businessAddress || "");
    setCity(businessInfo.businessCity || "");
    setState(businessInfo.businessState || "");
  }, [
    businessInfo.businessName,
    businessInfo.businessEmail,
    businessInfo.businessRegistrationNumber,
    businessInfo.businessAddress,
    businessInfo.businessCity,
    businessInfo.businessState,
  ]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setProfile({
      businessInfo: {
        businessName,
        businessEmail,
        businessRegistrationNumber: registrationNumber,
        businessAddress: address,
        businessCity: city,
        businessState: state,
      },
    });

    createProfile.mutate(undefined, {
      onSuccess: () => {
        // ✅ Show friendly success toast
        toast.success(`Welcome, ${businessName}! 🎉`, {
          description: "Your business profile is all set. Let's get started!",
          duration: 4000,
        });

        // ✅ Route to inventory after brief delay for toast visibility
        setTimeout(() => {
          router.replace("/listers/inventory");
        }, 1500);
      },
      onError: (error: any) => {
        // ✅ Show error toast
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create profile. Please try again.";

        toast.error("Oops! Something went wrong", {
          description: errorMessage,
          duration: 4000,
        });
      },
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Username / Brand Name
            </Paragraph1>
            <ToolInfo content="Your public business or brand name shown to customers." />
          </div>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-4 pl-12 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Business Email
            </Paragraph1>
            <ToolInfo content="Used for verification, payouts, and important business notifications." />
            <span className="text-xs text-gray-500">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="Fill in to get account verified"
            className="w-full p-4 pl-12 border rounded-lg text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Business Registration Number
            </Paragraph1>
            <ToolInfo content="Official registration or CAC number used to verify your business." />
            <span className="text-xs text-gray-500">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Fill in to get account verified"
            className="w-full p-4 pl-12 border rounded-lg text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Business Address
            </Paragraph1>
            <ToolInfo content="Physical location used for logistics, pickups, or compliance." />
            <span className="text-xs text-gray-500">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Fill in to get account verified"
            className="w-full p-4 pl-12 border rounded-lg text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                City
              </Paragraph1>
              <ToolInfo content="City or local government area where your business operates." />
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
          </label>
          <CityLGASelect value={city} onChange={setCity} />
        </div>

        <div className="flex-1">
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                State
              </Paragraph1>
              <ToolInfo content="State used for regional compliance, taxes, and delivery calculations." />
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
          </label>
          <StateSelect value={state} onChange={setState} />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/2 py-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <Paragraph1>Previous</Paragraph1>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white flex items-center justify-center gap-2 transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Paragraph1>
            {isLoading ? "Setting up your profile..." : "Complete Setup"}
          </Paragraph1>
        </button>
      </div>
    </form>
  );
};

export default StepTwoBusinessDetails;
