"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { User, MapPin } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { CityLGASelect } from "./CityLGASelect";
import { StateSelect } from "./StateSelect";
import { PhoneInput } from "./PhoneInput";
import { RelationshipSelect } from "./RelationshipSelect";

interface StepTwoContactProps {
  onNext: () => void;
  onBack: () => void;
}

const StepTwoContact: React.FC<StepTwoContactProps> = ({ onNext, onBack }) => {
  const emergencyContacts = useProfileStore((s) => s.emergencyContacts);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+234");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(emergencyContacts.name || "");
    setRelationship(emergencyContacts.relationship || "");
    setPhoneNumber(emergencyContacts.phoneNumber || "+234");
    setCity(emergencyContacts.city || "");
    setState(emergencyContacts.state || "");
  }, [emergencyContacts]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !relationship || !phoneNumber || !city || !state) {
      setError("Please complete all required fields before continuing.");
      return;
    }

    setError(null);

    setProfile({
      emergencyContacts: {
        name: fullName,
        relationship,
        phoneNumber,
        city,
        state,
      },
    });

    onNext();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label className="block mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-800">
            Full Name
          </Paragraph1>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-4 pl-12 border rounded-lg"
          />
        </div>
      </div>

      <RelationshipSelect value={relationship} onChange={setRelationship} />

      <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />

      <div>
        <label className="block mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-800">
            Address
          </Paragraph1>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-4 pl-12 border rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <CityLGASelect value={city} onChange={setCity} />
        <StateSelect value={state} onChange={setState} />
      </div>

      {error && (
        <Paragraph1 className="text-sm text-red-600 text-center">
          {error}
        </Paragraph1>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/2 py-3 border rounded-lg"
        >
          Previous
        </button>

        <button
          type="submit"
          className="w-1/2 py-3 bg-black text-white rounded-lg"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default StepTwoContact;
