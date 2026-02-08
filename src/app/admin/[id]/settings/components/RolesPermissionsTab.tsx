// ENDPOINTS: GET /api/admin/settings/roles, POST /api/admin/settings/roles, PUT /api/admin/settings/roles/:roleId/permissions
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Edit2, X } from "lucide-react";

export default function RolesPermissionsTab() {
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState({
    users: true,
    listings: true,
    orders: true,
    disputes: true,
    payments: true,
    platformSettings: true,
  });
  const roles = [
    {
      name: "Super Admin",
      description: "Full system access and control",
      admins: 2,
    },
    {
      name: "Admin",
      description: "General administrative access",
      admins: 5,
    },
    {
      name: "Operations",
      description: "Manage orders and disputes",
      admins: 8,
    },
    {
      name: "Customer Support",
      description: "View-only access for support",
      admins: 12,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="font-bold text-gray-900">Admin Roles</Paragraph3>
        <button
          onClick={() => setShowAddRoleModal(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          <Paragraph1 className="text-white">+ Add Role</Paragraph1>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  ROLE NAME
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  DESCRIPTION
                </Paragraph1>
              </th>
              <th className="text-left py-4 px-4">
                <Paragraph1 className="text-gray-900 font-bold">
                  NUMBER OF ADMINS
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
            {roles.map((role, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {role.name}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-600">
                    {role.description}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {role.admins}
                  </Paragraph1>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => {
                      setSelectedRole(role.name);
                      setShowEditPermissionsModal(true);
                    }}
                    className="px-4 py-2 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    <Paragraph1 className="text-gray-900">
                      Edit Permissions
                    </Paragraph1>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 bg-opacity-50"
            onClick={() => setShowAddRoleModal(false)}
          />

          {/* Modal - Slide in from Right */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-out">
            <div className="p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <Paragraph3 className=" font-bold text-gray-900">
                  Create New Role
                </Paragraph3>
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <Paragraph1 className="text-gray-500 mb-8">
                Add a new admin role with custom permissions
              </Paragraph1>

              {/* Form */}
              <div className="space-y-6 flex-1">
                <div>
                  <Paragraph1 className="text-gray-900 font-medium mb-2">
                    Role Name
                  </Paragraph1>
                  <input
                    type="text"
                    placeholder="e.g., Content Manager"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <Paragraph1 className="text-gray-900 font-medium mb-2">
                    Description
                  </Paragraph1>
                  <textarea
                    placeholder="Brief description of this role's responsibilities"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddRoleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
                <button
                  onClick={() => {
                    console.log("Create role:", { roleName, roleDescription });
                    setShowAddRoleModal(false);
                    setRoleName("");
                    setRoleDescription("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  <Paragraph1 className="text-white">Create Role</Paragraph1>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditPermissionsModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditPermissionsModal(false)}
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
            <div className="p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <Paragraph3 className="text-gray-900 font-bold">
                  Edit Permissions
                </Paragraph3>
                <button
                  onClick={() => setShowEditPermissionsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <Paragraph1 className="text-gray-500 mb-8">
                Manage permissions for {selectedRole}
              </Paragraph1>

              {/* Permissions */}
              <div className="space-y-4 flex-1">
                {Object.entries(permissions).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    users: "Users",
                    listings: "Listings",
                    orders: "Orders",
                    disputes: "Disputes",
                    payments: "Payments",
                    platformSettings: "Platform Settings",
                  };

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <Paragraph1 className="text-gray-900 font-medium">
                        {labels[key]}
                      </Paragraph1>
                      <button
                        onClick={() =>
                          setPermissions((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof prev],
                          }))
                        }
                        className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                          value ? "bg-gray-900" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            value ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditPermissionsModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
                <button
                  onClick={() => {
                    console.log(
                      `Save permissions for ${selectedRole}:`,
                      permissions,
                    );
                    setShowEditPermissionsModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  <Paragraph1 className="text-white">
                    Save Permissions
                  </Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
