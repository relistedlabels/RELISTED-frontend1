"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { MapPin, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { PhoneInput } from "./PhoneInput";
import { StateSelect } from "./StateSelect";
import { CityLGASelect } from "./CityLGASelect";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateProfile } from "@/lib/queries/user/useCreateProfile";

interface StepOnePersonalProps {
  onNext: () => void;
}

const StepOnePersonal: React.FC<StepOnePersonalProps> = ({ onNext }) => {
  const profile = useProfileStore((s) => s);
  const setProfile = useProfileStore((s) => s.setProfile);
  const router = useRouter();
  const createProfile = useCreateProfile();
  const isLoading = createProfile.isPending;

  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [address, setAddress] = useState(profile.address.street);
  const [cityLGA, setCityLGA] = useState(profile.address.city);
  const [state, setState] = useState(profile.address.state);
  const [bvn, setBvn] = useState(profile.bvn);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPhoneNumber(profile.phoneNumber || "+234");
    setAddress(profile.address.street || "");
    setCityLGA(profile.address.city || "");
    setState(profile.address.state || "");
    setBvn(profile.bvn || "");
  }, [
    profile.phoneNumber,
    profile.address.street,
    profile.address.city,
    profile.address.state,
    profile.bvn,
  ]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !address || !cityLGA || !state) {
      setError("Please complete all required fields before continuing.");
      return;
    }

    setError(null);

    setProfile({
      phoneNumber,
      bvn,
      address: {
        street: address,
        city: cityLGA,
        state,
        country: "Nigeria",
      },
    });
    createProfile.mutate(undefined, {
      onSuccess: () => {
        toast.success(`Profile created! 🎉`, {
          description:
            "You're all set to discover rentals and great finds — happy shopping!",
          duration: 4000,
        });

        setTimeout(() => {
          router.replace("/listers/inventory");
        }, 1500);
      },
      onError: (error: any) => {
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
      <div className="">
        <label className="block mb-2">
          <div className="flex items-center gap-1">
            <Paragraph1 className="text-sm font-medium text-gray-800">
              Phone Number
            </Paragraph1>
            <ToolInfo content="Your primary contact number used for verification and notifications." />
          </div>
        </label>
        <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
      </div>

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
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-4 pl-12 border rounded-lg"
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
              <ToolInfo content="City or local government area of residence." />
            </div>
          </label>
          <CityLGASelect value={cityLGA} onChange={setCityLGA} />
        </div>

        <div className="flex-1">
          <label className="block mb-2">
            <div className="flex items-center gap-1">
              <Paragraph1 className="text-sm font-medium text-gray-800">
                State
              </Paragraph1>
              <ToolInfo content="State of residence used for compliance and regional services." />
            </div>
          </label>
          <StateSelect value={state} onChange={setState} />
        </div>
      </div>

      {error && (
        <Paragraph1 className="text-sm text-red-600 text-center">
          {error}
        </Paragraph1>
      )}

      {/* <button
        type="submit"
        className="w-full py-3 bg-black text-white rounded-lg"
      >
        <Paragraph1>Next</Paragraph1>
      </button> */}

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
    </form>
  );
};

export default StepOnePersonal;
