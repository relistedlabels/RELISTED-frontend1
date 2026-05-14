"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

type Role = "RENTER" | "LISTER";

interface RoleOptionProps {
  title: string;
  description: string;
  imageUrl: string;
  onContinue: (role: Role) => void;
  roleKey: Role;
}

const RoleOption: React.FC<RoleOptionProps> = ({
  title,
  description,
  imageUrl,
  onContinue,
  roleKey,
}) => {
  return (
    <div className="flex flex-col bg-white shadow-lg hover:shadow-xl p-4 border border-gray-200 rounded-xl w-full transition">
      <div className="h-[320px] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="rounded-xl w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col mt-4 grow">
        <Paragraph3 className="mb-2 font-bold text-gray-900 text-xl">
          {title}
        </Paragraph3>
        <Paragraph1 className="mb-4 text-gray-600 text-sm grow">
          {description}
        </Paragraph1>
      </div>

      <div className="p-4 border-gray-100 border-t">
        <button
          onClick={() => onContinue(roleKey)}
          className="bg-[#231F20] hover:bg-gray-800 py-3 rounded-lg w-full font-semibold text-white text-sm transition"
        >
          <Paragraph1>Continue as a {title}</Paragraph1>
        </button>
      </div>
    </div>
  );
};

const AccountRoleSelector: React.FC = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser); // ✅ correct API

  const handleRoleSelection = (role: Role) => {
    // Persist role using existing store API
    setUser({ role });

    router.push("/auth/create-account/sign-up");
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen font-sans">
      <div className="bg-white shadow-2xl p-4 sm:p-10 py-10 rounded-xl w-full max-w-4xl text-center">
        <div className="flex justify-center items-center w-full"> </div>{" "}
        <div className="flex justify-center mb-6">
          <img src="/images/logo1.svg" alt="Logo" />
        </div>
        <Paragraph3 className="mb-2 font-bold text-gray-900 text-2xl">
          Who are you joining as?
        </Paragraph3>
        <Paragraph1 className="mb-8 text-gray-600 text-sm">
          Choose how you want to get started. You can switch roles anytime.
        </Paragraph1>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <RoleOption
            title="Renter or Buyer"
            description="I want to rent or buy stylish, quality pieces for events, everyday wear, or content creation."
            imageUrl="/images/sin1.jpg"
            onContinue={handleRoleSelection}
            roleKey="RENTER"
          />

          <RoleOption
            title="Lister"
            description="I want to list my fashion pieces and earn by sharing my wardrobe with others."
            imageUrl="/images/sin2.jpg"
            onContinue={handleRoleSelection}
            roleKey="LISTER"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountRoleSelector;
