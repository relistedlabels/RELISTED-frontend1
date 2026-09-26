"use client";

import { User } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";

export function UserProfileBadge() {
  const { data } = useListerProfile();
  const profile = data?.data.profile;

  
  const name = profile?.fullName?.trim() || "New user";
  const role = profile?.role;
  const avatar = profile?.profileImage ?? null;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-12 h-12 rounded-full bg-gray-800 ring-1 ring-white/15 overflow-hidden flex items-center justify-center shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <div className="min-w-0">
        <Paragraph1 className="text-sm font-semibold text-white truncate">
          {name}
        </Paragraph1>
        {role && (
          <Paragraph1 className="text-[11px] uppercase tracking-widest text-gray-400 mt-0.5 truncate">
            {role}
          </Paragraph1>
        )}
      </div>
    </div>
  );
}
