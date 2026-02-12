"use client";

import { User } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/user/useProfile";

export function UserProfileBadge() {
  const { data: profile } = useProfile();

  const name = profile?.user?.name?.trim() || "New user";
  const role = profile?.user?.role;
  const avatar = null; // avatar URL not yet exposed from profile API

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <div className=" ">
        <Paragraph1 className="text-sm font-medium text-white">
          {name}
        </Paragraph1>

        {role && (
          <Paragraph1 className="text-xs text-gray-500">
            - {role.toUpperCase()} -
          </Paragraph1>
        )}
      </div>
    </div>
  );
}
