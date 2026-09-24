// ENDPOINTS: GET /api/admin/settings/admins, POST /api/admin/settings/admins, PUT /api/admin/settings/admins/:adminId, POST /api/admin/settings/admins/:adminId/suspend
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Eye, X } from "lucide-react";
import { useAdmins } from "@/lib/queries/admin/useSettings";
import { useSuspendAdmin } from "@/lib/mutations/admin";

export default function AdminManagementTab() {
  // API Query
  const { data: adminsData, isLoading, error } = useAdmins(1, 20);

  // Log errors to console only
  if (error) {
    console.error("Failed to load admins:", error);
  }

  const admins: any[] = adminsData?.data || [];
  const showSkeleton = isLoading || !!error;

  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<(typeof admins)[0] | null>(
    null,
  );
  const [showSuspendConfirmation, setShowSuspendConfirmation] = useState(false);

  // API Mutation
  const { mutate: suspendAdmin, isPending: isSuspending } = useSuspendAdmin();

  type AdminRow = (typeof admins)[0];
  const adminColumns: ResponsiveColumnDef<AdminRow>[] = [
    {
      id: "name",
      header: "Admin Name",
      mobile: "primary",
      render: (admin) => (
        <Paragraph1 className="font-medium text-gray-900">{admin.name}</Paragraph1>
      ),
    },
    {
      id: "email",
      header: "Email",
      mobile: "detail",
      render: (admin) => (
        <Paragraph1 className="text-gray-600">{admin.email}</Paragraph1>
      ),
    },
    {
      id: "role",
      header: "Role",
      mobile: "detail",
      render: (admin) => (
        <Paragraph1 className="font-medium text-gray-900">{admin.role}</Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (admin) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            admin.isSuspended
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {admin.isSuspended ? "Suspended" : "Active"}
        </span>
      ),
    },
    {
      id: "lastActive",
      header: "Last Active",
      mobile: "detail",
      render: (admin) => (
        <Paragraph1 className="text-gray-600">
          {new Date(admin.updatedAt).toLocaleDateString()}
        </Paragraph1>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (admin) => (
        <button
          type="button"
          onClick={() => {
            setSelectedAdmin(admin);
            setShowAdminProfile(true);
          }}
          className="text-gray-600 transition-colors hover:text-gray-900"
        >
          <Eye size={20} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Paragraph3 className="text-gray-900 font-bold">Admin Users</Paragraph3>
        <button
          disabled={showSkeleton}
          className="px-4 py-2 hidden bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
        >
          <Paragraph1 className="text-white">+ Add Admin</Paragraph1>
        </button>
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <ResponsiveDataTable
          rows={admins}
          columns={adminColumns}
          getRowKey={(admin) => admin.id}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No admins found
            </Paragraph1>
          }
        />
      )}

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
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <Paragraph1 className="text-gray-600 font-bold text-lg">
                      {selectedAdmin.name.charAt(0).toUpperCase()}
                    </Paragraph1>
                  </div>
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
                        selectedAdmin.isSuspended
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedAdmin.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Verified
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {selectedAdmin.isVerified ? "Yes" : "No"}
                    </Paragraph1>
                  </div>
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Last Active
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {new Date(selectedAdmin.updatedAt).toLocaleDateString()}
                    </Paragraph1>
                  </div>
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600 font-medium">
                      Created At
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              {/* Token Version Info */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <Paragraph1 className="text-gray-900 font-bold mb-4">
                  Additional Info
                </Paragraph1>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600">
                      Token Version
                    </Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium">
                      {selectedAdmin.tokenVersion}
                    </Paragraph1>
                  </div>
                  <div className="flex justify-between">
                    <Paragraph1 className="text-gray-600">Admin ID</Paragraph1>
                    <Paragraph1 className="text-gray-900 font-medium text-xs">
                      {selectedAdmin.id}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button className="w-full hidden px-4 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-medium">
                  <Paragraph1 className="text-gray-900">
                    Reset Password
                  </Paragraph1>
                </button>
                <button
                  onClick={() => setShowSuspendConfirmation(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  <Paragraph1 className="text-white">Suspend Admin</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendConfirmation && selectedAdmin && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuspendConfirmation(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal - Center */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <Paragraph2 className="text-gray-900 font-bold mb-2">
                Suspend Admin?
              </Paragraph2>
              <Paragraph1 className="text-gray-600 mb-6">
                Are you sure you want to suspend{" "}
                <span className="font-medium">{selectedAdmin.name}</span>? They
                will not be able to access the admin panel.
              </Paragraph1>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuspendConfirmation(false)}
                  disabled={isSuspending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
                <button
                  onClick={() => {
                    suspendAdmin(
                      { adminId: selectedAdmin.id, suspended: true },
                      {
                        onSuccess: () => {
                          toast.success(
                            `${selectedAdmin.name} has been suspended!`,
                            {
                              description: "Admin access has been revoked.",
                            },
                          );
                          setShowSuspendConfirmation(false);
                          setShowAdminProfile(false);
                        },
                        onError: (error: any) => {
                          toast.error("Failed to suspend admin", {
                            description:
                              error?.message || "Please try again later.",
                          });
                        },
                      },
                    );
                  }}
                  disabled={isSuspending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  <Paragraph1 className="text-white">
                    {isSuspending ? "Suspending..." : "Suspend"}
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
