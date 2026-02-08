// ENDPOINTS: GET /api/admin/settings/profile
"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

export default function UserHeader() {
  return (
    <div className="bg-white rounded-lg py-6 flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex items-start gap-4">
        <img
          src="https://i.pravatar.cc/80?img=10"
          alt="Jane Graham"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Paragraph2 className="text-gray-900">Jane Graham</Paragraph2>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
              Super Admin
            </span>
          </div>
          <Paragraph1 className="text-gray-500">
            Last login: Today at 10:30 AM
          </Paragraph1>
        </div>
      </div>
      <button className="mt-4 md:mt-0 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
        <Paragraph1>View Profile</Paragraph1>
      </button>
    </div>
  );
}
