// ENDPOINTS: GET /api/admin/settings/admins, POST /api/admin/settings/admins, PUT /api/admin/settings/admins/:adminId
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Eye, X } from "lucide-react";

export default function AdminManagementTab() {
  const admins = [
    {
      id: 1,
      name: "Jane Graham",
      email: "admin@relisted.com",
      role: "Super Admin",
      status: "Active",
      lastActive: "2 mins ago",
      avatar: "https://i.pravatar.cc/150?img=1",
      recentActions: [
        { action: "Updated platform commission", time: "2 hours ago" },
        { action: "Suspended user #12345", time: "5 hours ago" },
        { action: "Resolved dispute #DIS-789", time: "1 day ago" },
      ],
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@relisted.com",
      role: "Admin",
      status: "Active",
      lastActive: "15 mins ago",
      avatar: "https://i.pravatar.cc/150?img=2",
      recentActions: [
        { action: "Reviewed new listings", time: "3 hours ago" },
        { action: "Updated user permissions", time: "6 hours ago" },
        { action: "Processed refund request", time: "2 days ago" },
      ],
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah@relisted.com",
      role: "Operations",
      status: "Active",
      lastActive: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?img=3",
      recentActions: [
        { action: "Managed order disputes", time: "4 hours ago" },
        { action: "Updated inventory settings", time: "8 hours ago" },
        { action: "Generated monthly report", time: "3 days ago" },
      ],
    },
    {
      id: 4,
      name: "David Martinez",
      email: "david@relisted.com",
      role: "Customer Support",
      status: "Suspended",
      lastActive: "3 days ago",
      avatar: "https://i.pravatar.cc/150?img=4",
      recentActions: [
        { action: "Handled customer inquiries", time: "3 days ago" },
        { action: "Updated help documentation", time: "5 days ago" },
        { action: "Processed support tickets", time: "1 week ago" },
      ],
    },
  ];

  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<(typeof admins)[0] | null>(
    null,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="text-gray-900 font-bold">Admin Users</Paragraph3>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
          <Paragraph1 className="text-white">+ Add Admin</Paragraph1>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  ADMIN NAME
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  EMAIL
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  ROLE
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  STATUS
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  LAST ACTIVE
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  ACTION
                </Paragraph1>
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <Paragraph1 className="text-gray-900 font-medium">
                      {admin.name}
                    </Paragraph1>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-600">
                    {admin.email}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {admin.role}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      admin.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-600">
                    {admin.lastActive}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowAdminProfile(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Profile Modal */}
      {showAdminProfile && selectedAdmin && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdminProfile(false)}
            className="absolute inset-0 bg-black/50 bg-opacity-50"
          />

          {/* Modal - Slide in from Right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg"
          >
            <div className="p-8 h-full flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Paragraph3 className="text-gray-900 font-bold">
                  Admin Profile
                </Paragraph3>
                <button
                  onClick={() => setShowAdminProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <Paragraph1 className="text-gray-500 mb-8">
                View and manage admin user details
              </Paragraph1>

              {/* Admin Info */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedAdmin.avatar}
                    alt={selectedAdmin.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <Paragraph2 className="text-gray-900 font-bold text-lg">
                      {selectedAdmin.name}
                    </Paragraph2>
                    <Paragraph1 className="text-gray-500">
                      {selectedAdmin.email}
                    </Paragraph1>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Role
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {selectedAdmin.role}
                    </Paragraph1>
                  </div>
                  <div className="flex justify-between items-center">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Status
                    </Paragraph1>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedAdmin.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedAdmin.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Last Active
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {selectedAdmin.lastActive}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              {/* Recent Actions */}
              <div className="mb-8 flex-1">
                <Paragraph1 className="text-gray-900 font-bold mb-4">
                  Recent Actions
                </Paragraph1>
                <div className="space-y-3">
                  {selectedAdmin.recentActions.map((action, idx) => (
                    <div key={idx} className="flex justify-between">
                      <Paragraph1 className="text-gray-600">
                        {action.action}
                      </Paragraph1>
                      <Paragraph1 className="text-gray-400 text-xs">
                        {action.time}
                      </Paragraph1>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button className="w-full px-4 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium">
                  <Paragraph1 className="text-gray-900">
                    Reset Password
                  </Paragraph1>
                </button>
                <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  <Paragraph1 className="text-white">Suspend Admin</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
