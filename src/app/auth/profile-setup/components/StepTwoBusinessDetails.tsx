"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { User, Mail, Hash, MapPin, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { useUserStore } from "@/store/useUserStore";
import { CityLGASelect } from "./CityLGASelect";
import { StateSelect } from "./StateSelect";
import { useRouter } from "next/navigation";
import { useUpgradeLister } from "@/lib/mutations/listers/useUpgradeLister";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { toast } from "sonner";

interface StepTwoBusinessDetailsProps {
  onNext: () => void;
  onBack: () => void;
  returnUrl?: string | null;
}

const StepTwoBusinessDetails: React.FC<StepTwoBusinessDetailsProps> = ({
  onNext,
  onBack,
  returnUrl,
}) => {
  const businessInfo = useProfileStore((s) => s.businessInfo);
  const setProfile = useProfileStore((s) => s.setProfile);
  const role = useUserStore((s) => s.role);
  const userId = useUserStore((s) => s.userId);
  const setUser = useUserStore((s) => s.setUser);

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
  const upgradeLister = useUpgradeLister();
  const isLoading = upgradeLister.isPending;

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

    // Set business info in store
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

    // Call upgrade endpoint (handles profile creation and business info in one call)
    upgradeLister.mutate(undefined, {
      onSuccess: () => {
        // Set user role to LISTER
        setUser({ role: "LISTER" });

        toast.success(`Welcome, ${businessName}! 🎉`, {
          description:
            "You're all set to browse rentals and snag great finds — happy shopping!",
          duration: 4000,
        });
        setTimeout(() => {
          const redirectUrl = returnUrl
            ? decodeURIComponent(returnUrl)
            : "/listers/dashboard";
          router.replace(redirectUrl);
        }, 1500);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to upgrade to lister. Please try again.";
        toast.error("Upgrade Failed", {
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
            <Paragraph1 className="font-medium text-gray-800 text-sm">
              Username / Brand Name
            </Paragraph1>
            <ToolInfo content="Your public business or brand name shown to customers." />
          </div>
        </label>
        <div className="relative">
          <User className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="p-4 pl-12 border rounded-lg w-full"
            required
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="font-medium text-gray-800 text-sm">
              Business Email
            </Paragraph1>
            <ToolInfo content="Used for verification, payouts, and important business notifications." />
            <span className="text-gray-500 text-xs">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <Mail className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="e.g. info@yourbrand.com"
            className="p-4 pl-12 border rounded-lg w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="font-medium text-gray-800 text-sm">
              Business Registration Number
            </Paragraph1>
            <ToolInfo content="Official registration or CAC number used to verify your business." />
            <span className="text-gray-500 text-xs">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <Hash className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="e.g. CAC-2024-001234"
            className="p-4 pl-12 border rounded-lg w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="font-medium text-gray-800 text-sm">
              Business Address
            </Paragraph1>
            <ToolInfo content="Physical location used for logistics, pickups, or compliance." />
            <span className="text-gray-500 text-xs">(Optional)</span>
          </div>
        </label>
        <div className="relative">
          <MapPin className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Fashion St, Lagos"
            className="p-4 pl-12 border rounded-lg w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="font-medium text-gray-800 text-sm">
                City
              </Paragraph1>
              <ToolInfo content="City or local government area where your business operates." />
              <span className="text-gray-500 text-xs">(Optional)</span>
            </div>
          </label>
          <CityLGASelect value={city} onChange={setCity} />
        </div>

        <div className="flex-1">
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="font-medium text-gray-800 text-sm">
                State
              </Paragraph1>
              <ToolInfo content="State used for regional compliance, taxes, and delivery calculations." />
              <span className="text-gray-500 text-xs">(Optional)</span>
            </div>
          </label>
          <StateSelect value={state} onChange={setState} />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="hover:bg-gray-50 py-3 border rounded-lg w-1/2 transition"
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
