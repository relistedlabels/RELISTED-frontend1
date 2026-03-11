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
    <div className="w-full p-4 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col transition hover:shadow-xl">
      <div className="h-[320px] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full rounded-xl object-cover"
        />
      </div>

      <div className="mt-4 flex flex-col grow">
        <Paragraph3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </Paragraph3>
        <Paragraph1 className="text-sm text-gray-600 grow mb-4">
          {description}
        </Paragraph1>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => onContinue(roleKey)}
          className="w-full py-3 text-sm font-semibold text-white bg-[#231F20] rounded-lg hover:bg-gray-800 transition"
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
    <div className="font-sans min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white p-4 py-10 sm:p-10 rounded-xl shadow-2xl text-center">
        <div className=" flex w-full  items-center justify-center">
          {" "}
         
        </div>{" "}
        <div className="mb-6 flex justify-center">
          <img src="/images/logo1.svg" alt="Logo" />
        </div>
        <Paragraph3 className="text-2xl font-bold text-gray-900 mb-2">
          Who are you joining as?
        </Paragraph3>
        <Paragraph1 className="text-sm text-gray-600 mb-8">
          Choose how you want to get started. You can switch roles anytime.
        </Paragraph1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleOption
            title="Renter"
            description="I want to rent stylish, quality pieces for events, everyday wear, or content creation."
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
