// ENDPOINTS: GET /api/admin/settings/profile, GET /api/admin/settings/platform-controls, GET /api/admin/settings/roles, GET /api/admin/settings/admins, GET /api/admin/settings/audit-logs
"use client";

import { FileText, Settings, Shield, User, Users } from "lucide-react";
import { useState } from "react";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { Paragraph1 } from "@/common/ui/Text";
import AdminManagementTab from "./components/AdminManagementTab";
import AuditLogsTab from "./components/AuditLogsTab";
import PlatformControlsTab from "./components/PlatformControlsTab";
import ProfileSecurityTab from "./components/ProfileSecurityTab";
import RolesPermissionsTab from "./components/RolesPermissionsTab";
import UserHeader from "./components/UserHeader";

type TabType =
  | "profile-security"
  | "platform-controls"
  | "roles-permissions"
  | "admin-management"
  | "audit-logs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile-security");

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: "profile-security",
      label: "Profile & Security",
      icon: <User size={18} />,
    },
    // {
    //   id: "platform-controls",
    //   label: "Platform Controls",
    //   icon: <Settings size={18} />,
    // },
    // {
    //   id: "roles-permissions",
    //   label: "Roles & Permissions",
    //   icon: <Users size={18} />,
    // },
    {
      id: "admin-management",
      label: "Admin Management",
      icon: <Shield size={18} />,
    },
    { id: "audit-logs", label: "Audit Logs", icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <AdminPageHeader
        title="Settings"
        description="Manage platform settings and admin access."
      />

      {/* User Profile Card */}
      <UserHeader />

      {/* Tabs */}
      <div className="bg-white rounded-lg mt-8 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              <Paragraph1>{tab.label}</Paragraph1>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-6 md:py-8">
          {activeTab === "profile-security" && <ProfileSecurityTab />}
          {/* {activeTab === "platform-controls" && <PlatformControlsTab />} */}
          {/* {activeTab === "roles-permissions" && <RolesPermissionsTab />} */}
          {activeTab === "admin-management" && <AdminManagementTab />}
          {activeTab === "audit-logs" && <AuditLogsTab />}
        </div>
      </div>
    </div>
  );
}
