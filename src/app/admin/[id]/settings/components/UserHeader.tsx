// ENDPOINTS: GET /api/auth/me, GET /api/users/profile
"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";

const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 0) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "";
};

const getAvatarBgColor = (name: string): string => {
  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function UserHeader() {
  const { data: user } = useMe();
  const { data: profile } = useProfile();

  const isLoading = !user || !profile;
  const userName = user?.name || "Loading...";
  const userRole = user?.role || "ADMIN";
  const userAvatar = profile?.avatar;

  return (
    <div className="bg-white rounded-lg py-6 flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex items-start gap-4">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center font-bold text-white text-lg ${getAvatarBgColor(userName)}`}
          >
            {getInitials(userName)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Paragraph2 className="text-gray-900">{userName}</Paragraph2>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium uppercase">
              {userRole}
            </span>
          </div>
          <Paragraph1 className="text-gray-500">
            Last login: Today at 10:30 AM
          </Paragraph1>
        </div>
      </div>
      <button className="mt-4 hidden md:mt-0 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
        <Paragraph1>View Profile</Paragraph1>
      </button>
    </div>
  );
}
