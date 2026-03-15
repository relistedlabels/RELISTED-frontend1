// ENDPOINTS: GET /api/admin/users/:userId, GET /api/admin/users/:userId/rentals, GET /api/admin/users/:userId/listings, GET /api/admin/users/:userId/wallet, GET /api/admin/users/:userId/transactions, GET /api/admin/users/:userId/disputes, GET /api/admin/users/:userId/favorites, PATCH /api/admin/users/:userId/suspend, DELETE /api/admin/users/:userId
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Package,
  Heart,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  useUserById,
  useUserRentals,
  useUserListings,
  useUserWallet,
  useUserTransactions,
  useUserDisputes,
  useUserFavorites,
} from "@/lib/queries/admin/useUsers";
import { useSuspendUser, useDeleteUser } from "@/lib/mutations/admin";
import UserProfileOverview from "./components/UserProfileOverview";
import UserRecords from "./components/UserRecords";
import UserListings from "./components/UserListings";
import UserWallet from "./components/UserWallet";
import UserDisputes from "./components/UserDisputes";
import SavedItems from "./components/SavedItems";

interface UserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const TABS = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "rentals", label: "Rentals", icon: ShoppingBag },
  { id: "listings", label: "Listings", icon: Package },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "disputes", label: "Disputes", icon: AlertCircle },
  { id: "favorites", label: "Saved Items", icon: Heart },
];

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const adminId = useAdminIdStore((state) => state.adminId);
  const [activeTab, setActiveTab] = useState("summary");
  const [direction, setDirection] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);

  // API Mutations
  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // Unwrap the params Promise
  const { userId } = React.use(params);

  // Fetch all user data from hooks
  const userProfile = useUserById(userId);
  const userRentals = useUserRentals(userId, { page: 1, limit: 10 });
  const userListings = useUserListings(userId, { page: 1, limit: 10 });
  const userWallet = useUserWallet(userId);
  const userTransactions = useUserTransactions(userId, {
    page: 1,
    limit: 10,
  });
  const userDisputes = useUserDisputes(userId, { page: 1, limit: 10 });
  const userFavorites = useUserFavorites(userId, { page: 1, limit: 10 });

  // Show loading state while fetching main user profile
  if (userProfile.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TableSkeleton />
      </div>
    );
  }

  // Show error state if profile fetch fails
  if (userProfile.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Paragraph1 className="text-red-600 font-semibold">
            Error loading user profile
          </Paragraph1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const user = userProfile.data?.data as any;

  const handleTabChange = (tabId: string) => {
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const newIndex = TABS.findIndex((t) => t.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  const handleGoBack = () => {
    if (adminId) {
      router.push(`/admin/${adminId}/users`);
    } else {
      router.back();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return user ? <UserProfileOverview user={user} /> : <TableSkeleton />;
      case "rentals":
        return userRentals.isLoading ? (
          <TableSkeleton />
        ) : userRentals.error ? (
          <Paragraph1 className="text-red-600">
            Error loading rentals
          </Paragraph1>
        ) : (
          <UserRecords rentals={userRentals.data?.data?.rentals || []} />
        );
      case "listings":
        return userListings.isLoading ? (
          <TableSkeleton />
        ) : userListings.error ? (
          <Paragraph1 className="text-red-600">
            Error loading listings
          </Paragraph1>
        ) : (
          <UserListings listings={userListings.data?.data || []} />
        );
      case "wallet":
        return userWallet.isLoading ? (
          <TableSkeleton />
        ) : userWallet.error ? (
          <Paragraph1 className="text-red-600">Error loading wallet</Paragraph1>
        ) : (
          <UserWallet
            wallet={userWallet.data?.data}
            transactions={userTransactions.data?.data || []}
            transactionsLoading={userTransactions.isLoading}
            transactionsError={userTransactions.error}
          />
        );
      case "disputes":
        return userDisputes.isLoading ? (
          <TableSkeleton />
        ) : userDisputes.error ? (
          <Paragraph1 className="text-red-600">
            Error loading disputes
          </Paragraph1>
        ) : (
          <UserDisputes disputes={userDisputes.data?.data?.disputes || []} />
        );
      case "favorites":
        return userFavorites.isLoading ? (
          <TableSkeleton />
        ) : userFavorites.error ? (
          <Paragraph1 className="text-red-600">
            Error loading saved items
          </Paragraph1>
        ) : (
          <SavedItems favorites={userFavorites.data?.data || []} />
        );
      default:
        return user ? <UserProfileOverview user={user} /> : <TableSkeleton />;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 border-b border-gray-200 pb-6">
          <div className="flex items-start gap-4 flex-1">
            <img
              src={
                user?.profile?.avatarUpload?.url ||
                "https://i.pravatar.cc/150?img=0"
              }
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {user?.name || "Loading..."}
              </Paragraph2>
              <Paragraph1 className="text-2xl py-1 text-gray-900 tracking-tight">
                {user?.role || "Loading..."}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-500">
                Joined{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })
                  : "—"}
              </Paragraph1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowActionModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              Suspend
            </button>
            <button
              onClick={handleGoBack}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {TABS.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-4 transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-black border-b-4 border-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComponent size={18} />
                  <Paragraph1 className="font-medium">{tab.label}</Paragraph1>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="py-6"
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && user && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActionModal(false)}
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
              <div className="flex items-center justify-between mb-4">
                <Paragraph2 className="text-gray-900 font-bold">
                  User Action
                </Paragraph2>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <Paragraph1 className="text-gray-600 mb-6">
                What action would you like to take for{" "}
                <span className="font-medium">{user.name}</span>?
              </Paragraph1>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    suspendUser(userId, {
                      onSuccess: () => {
                        toast.success(`${user.name} has been suspended!`, {
                          description:
                            "User access has been temporarily revoked.",
                        });
                        setShowActionModal(false);
                      },
                      onError: (error: any) => {
                        toast.error("Failed to suspend user", {
                          description:
                            error?.message || "Please try again later.",
                        });
                      },
                    });
                  }}
                  disabled={isSuspending || isDeleting}
                  className="w-full px-4 py-3 border-2 border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 font-medium disabled:opacity-50 transition"
                >
                  <Paragraph1 className="text-yellow-600">
                    {isSuspending ? "Suspending..." : "⚠️ Suspend User"}
                  </Paragraph1>
                </button>

                <button
                  onClick={() => {
                    deleteUser(userId, {
                      onSuccess: () => {
                        toast.success(
                          `${user.name}'s account has been permanently deleted!`,
                          {
                            description: "This action cannot be undone.",
                          },
                        );
                        setShowActionModal(false);
                        router.push(`/admin/${adminId}/users`);
                      },
                      onError: (error: any) => {
                        toast.error("Failed to delete user", {
                          description:
                            error?.message || "Please try again later.",
                        });
                      },
                    });
                  }}
                  disabled={isSuspending || isDeleting}
                  className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 transition"
                >
                  <Paragraph1 className="text-red-600">
                    {isDeleting ? "Deleting..." : "🗑️ Delete Account"}
                  </Paragraph1>
                </button>

                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={isSuspending || isDeleting}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
