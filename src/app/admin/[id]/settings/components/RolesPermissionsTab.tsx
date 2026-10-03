// ENDPOINTS: GET /api/admin/settings/roles, POST /api/admin/settings/roles, PUT /api/admin/settings/roles/:roleId/permissions
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Edit2, X } from "lucide-react";
import { useRoles } from "@/lib/queries/admin/useSettings";
import { useCreateRole, useUpdateRolePermissions } from "@/lib/mutations/admin";

export default function RolesPermissionsTab() {
  // API Query
  const { data: rolesData, isLoading, error } = useRoles();

  // Log errors to console only
  if (error) {
    console.error("Failed to load roles:", error);
  }

  const roles = rolesData?.data?.roles || [];
  const showSkeleton = isLoading || !!error;

  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[0] | null>(
    null,
  );
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

  type RoleRow = (typeof roles)[0];
  const roleColumns: ResponsiveColumnDef<RoleRow>[] = [
    {
      id: "name",
      header: "Role Name",
      mobile: "primary",
      render: (role) => (
        <Paragraph1 className="font-medium text-gray-900">{role.name}</Paragraph1>
      ),
    },
    {
      id: "description",
      header: "Description",
      mobile: "detail",
      render: (role) => (
        <Paragraph1 className="text-gray-600">{role.description}</Paragraph1>
      ),
    },
    {
      id: "adminCount",
      header: "Number of Admins",
      mobile: "detail",
      render: (role) => (
        <Paragraph1 className="font-medium text-gray-900">{role.adminCount}</Paragraph1>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (role) => (
        <button
          type="button"
          onClick={() => {
            setSelectedRole(role);
            setPermissions(role.permissions);
            setShowEditPermissionsModal(true);
          }}
          className="flex items-center gap-2 rounded-lg border border-gray-900 px-4 py-2 font-medium text-gray-900 hover:bg-gray-50"
        >
          <Edit2 size={16} />
          <Paragraph1 className="text-gray-900">Edit Permissions</Paragraph1>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="font-bold text-gray-900">Admin Roles</Paragraph3>
        <button
          onClick={() => setShowAddRoleModal(true)}
          disabled={showSkeleton}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
        >
          <Paragraph1 className="text-white">+ Add Role</Paragraph1>
        </button>
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={4} columns={4} />
      ) : (
        <ResponsiveDataTable
          rows={roles}
          columns={roleColumns}
          getRowKey={(role) => role.id}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No roles found
            </Paragraph1>
          }
        />
      )}

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
                Manage permissions for {selectedRole?.name}
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
