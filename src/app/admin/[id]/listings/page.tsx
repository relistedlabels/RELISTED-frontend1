"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TableSkeleton, StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import ListingDetailModal from "./components/ListingDetailModal";
import PendingListingsTable from "./components/PendingListingsTable";
import ActiveListingsTable from "./components/ActiveListingsTable";
import SoldListingsTable from "./components/SoldListingsTable";
import RejectedListingsTable from "./components/RejectedListingsTable";
import ManagementPanel from "./components/ManagementPanel";
import {
  useListingsStatistics,
  useApproveListing,
  useRejectListing,
  useSetAvailability,
  usePendingProducts,
  useActiveProducts,
  useRejectedProducts,
} from "@/lib/queries/admin/useListings";
import { Product, ProductDetail } from "@/lib/api/admin/listings";

type TabType = "Pending" | "Active" | "Sold" | "Rejected";

export default function ListingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvingFromModalId, setApprovingFromModalId] = useState<
    string | null
  >(null);
  const [rejectingFromModalId, setRejectingFromModalId] = useState<
    string | null
  >(null);
  const [disablingFromModalId, setDisablingFromModalId] = useState<
    string | null
  >(null);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(
    null,
  );
  const [rejectionComment, setRejectionComment] = useState("");
  const [approvingProductId, setApprovingProductId] = useState<string | null>(
    null,
  );

  // Pagination state for each tab
  const [pendingPage, setPendingPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [soldPage, setSoldPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);

  // Fetch all statistics from API
  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
  } = useListingsStatistics();

  // Get stats data from the response
  const stats = statsResponse?.data;

  if (statsError) {
    console.error("Failed to load product statistics:", statsError);
  }

  const TABS: TabType[] = ["Pending", "Active", "Sold", "Rejected"];

  // Fetch products for active tab only to reduce API calls
  const { data: pendingResponse, isLoading: pendingLoading } =
    usePendingProducts(
      {
        page: pendingPage,
        count: 20,
      },
      activeTab === "Pending",
    );
  const { data: activeResponse, isLoading: activeLoading } = useActiveProducts(
    {
      page: activePage,
      count: 20,
    },
    activeTab === "Active",
  );
  const { data: soldResponse, isLoading: soldLoading } = useActiveProducts(
    {
      page: soldPage,
      count: 20,
    },
    activeTab === "Sold",
  );
  const { data: rejectedResponse, isLoading: rejectedLoading } =
    useRejectedProducts(
      {
        page: rejectedPage,
        count: 20,
      },
      activeTab === "Rejected",
    );

  const pendingProducts = pendingResponse?.data?.products || [];
  const activeProducts = activeResponse?.data?.products || [];
  const soldProducts = soldResponse?.data?.products || [];
  const rejectedProducts = rejectedResponse?.data?.products || [];

  // Pagination data
  const pendingTotal = pendingResponse?.data?.total || 0;
  const pendingTotalPages = pendingResponse?.data?.totalPages || 1;
  const activeTotal = activeResponse?.data?.total || 0;
  const activeTotalPages = activeResponse?.data?.totalPages || 1;
  const soldTotal = soldResponse?.data?.total || 0;
  const soldTotalPages = soldResponse?.data?.totalPages || 1;
  const rejectedTotal = rejectedResponse?.data?.total || 0;
  const rejectedTotalPages = rejectedResponse?.data?.totalPages || 1;

  // Mutations
  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();
  const setAvailabilityMutation = useSetAvailability();

  const handleApprove = (productId: string) => {
    setApprovingProductId(productId);

    // Prepare query key for cache update
    const queryKey = [
      "admin",
      "products",
      "pending",
      { page: pendingPage, count: 20 },
    ];

    // Get current cached data
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update cache to remove the product
    if (previousData) {
      queryClient.setQueryData(queryKey, (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          products: oldData.data.products.filter(
            (product: Product) => product.id !== productId,
          ),
          total: Math.max(0, (oldData.data.total || 1) - 1),
        },
      }));
    }

    approveMutation.mutate(productId, {
      onSuccess: (response) => {
        setApprovingProductId(null);
        const message =
          (response as any)?.message || "Product approved successfully!";
        toast.success(message);
      },
      onError: (error: any) => {
        setApprovingProductId(null);
        // Revert optimistic update on error
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        const errorMessage =
          error?.response?.data?.message || "Failed to approve product";
        toast.error(errorMessage);
      },
    });
  };

  const handleRejectClick = (productId: string) => {
    setRejectingProductId(productId);
    setRejectionComment("");
  };

  const handleConfirmReject = () => {
    if (rejectingProductId && rejectionComment.trim()) {
      // Prepare query key for cache update
      const queryKey = [
        "admin",
        "products",
        "pending",
        { page: pendingPage, count: 20 },
      ];

      // Get current cached data
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache to remove the product from pending
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData: any) => ({
          ...oldData,
          data: {
            ...oldData.data,
            products: oldData.data.products.filter(
              (product: Product) => product.id !== rejectingProductId,
            ),
            total: Math.max(0, (oldData.data.total || 1) - 1),
          },
        }));
      }

      rejectMutation.mutate(
        {
          productId: rejectingProductId,
          rejectionComment,
        },
        {
          onSuccess: (response) => {
            setRejectingProductId(null);
            setRejectionComment("");
            const message =
              (response as any)?.message || "Product rejected successfully!";
            toast.success(message);
          },
          onError: (error: any) => {
            setRejectingProductId(null);
            // Revert optimistic update on error
            if (previousData) {
              queryClient.setQueryData(queryKey, previousData);
            }
            const errorMessage =
              error?.response?.data?.message || "Failed to reject product";
            toast.error(errorMessage);
          },
        },
      );
    }
  };

  // Handlers for modal actions
  const handleModalApprove = (productId: string) => {
    setApprovingFromModalId(productId);
    const queryKey = [
      "admin",
      "products",
      "pending",
      { page: pendingPage, count: 20 },
    ];
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData) {
      queryClient.setQueryData(queryKey, (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          products: oldData.data.products.filter(
            (product: Product) => product.id !== productId,
          ),
          total: Math.max(0, (oldData.data.total || 1) - 1),
        },
      }));
    }

    approveMutation.mutate(productId, {
      onSuccess: (response) => {
        setApprovingFromModalId(null);
        setIsModalOpen(false);
        const message =
          (response as any)?.message || "Product approved successfully!";
        toast.success(message);
      },
      onError: (error: any) => {
        setApprovingFromModalId(null);
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        const errorMessage =
          error?.response?.data?.message || "Failed to approve product";
        toast.error(errorMessage);
      },
    });
  };

  const handleModalReject = (productId: string, comment: string) => {
    setRejectingFromModalId(productId);
    const queryKey = [
      "admin",
      "products",
      "pending",
      { page: pendingPage, count: 20 },
    ];
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData) {
      queryClient.setQueryData(queryKey, (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          products: oldData.data.products.filter(
            (product: Product) => product.id !== productId,
          ),
          total: Math.max(0, (oldData.data.total || 1) - 1),
        },
      }));
    }

    rejectMutation.mutate(
      {
        productId,
        rejectionComment: comment,
      },
      {
        onSuccess: (response) => {
          setRejectingFromModalId(null);
          setIsModalOpen(false);
          const message =
            (response as any)?.message || "Product rejected successfully!";
          toast.success(message);
        },
        onError: (error: any) => {
          setRejectingFromModalId(null);
          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
          const errorMessage =
            error?.response?.data?.message || "Failed to reject product";
          toast.error(errorMessage);
        },
      },
    );
  };

  const handleModalDisable = (productId: string) => {
    setDisablingFromModalId(productId);
    const queryKey = [
      "admin",
      "products",
      "active",
      { page: activePage, count: 20 },
    ];
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData) {
      queryClient.setQueryData(queryKey, (oldData: any) => ({
        ...oldData,
        data: {
          ...oldData.data,
          products: oldData.data.products.filter(
            (product: Product) => product.id !== productId,
          ),
          total: Math.max(0, (oldData.data.total || 1) - 1),
        },
      }));
    }

    setAvailabilityMutation.mutate(
      {
        productId,
        isAvailable: false,
      },
      {
        onSuccess: (response) => {
          setDisablingFromModalId(null);
          setIsModalOpen(false);
          const message =
            (response as any)?.message || "Product disabled successfully!";
          toast.success(message);
        },
        onError: (error: any) => {
          setDisablingFromModalId(null);
          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
          const errorMessage =
            error?.response?.data?.message || "Failed to disable product";
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="min-h-screen">
      {/* Modal for viewing details */}
      {selectedListing && (
        <ListingDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedListing}
        />
      )}

      {/* Rejection Modal */}
      {rejectingProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Product</h3>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-24 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectingProductId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionComment.trim() || rejectMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          Listings
        </Paragraph2>
        <Paragraph1 className="text-sm text-gray-600">
          Manage and review all curator-submitted listings.
        </Paragraph1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>

        {/* Category Dropdown and Export */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700 bg-white">
            All Categories
          </button>
          <button className="flex- hidden items-center justify-center gap-2 px-4 py-2 border border-gray-800 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium text-sm bg-white">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statsLoading || statsError ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Listings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Globe size={24} className="text-gray-700" />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Total Listings
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stats?.getTotalProducts?.count || 0}
              </Paragraph3>
            </div>

            {/* Pending Review */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Pending Review
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stats?.getPendingProducts?.count || 0}
              </Paragraph3>
            </div>

            {/* Active */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <CheckCircle size={24} className="text-blue-600" />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Active
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stats?.getActiveProducts?.count || 0}
              </Paragraph3>
            </div>

            {/* Approved */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Approved
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stats?.getApprovedProducts?.count || 0}
              </Paragraph3>
            </div>

            {/* Rejected */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <XCircle size={24} className="text-red-600" />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Rejected
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stats?.getRejectedProducts?.count || 0}
              </Paragraph3>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`py-4 px-0 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-gray-900 border-black"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {statsLoading || statsError ? (
          <TableSkeleton rows={5} />
        ) : (
          <>
            {activeTab === "Pending" && (
              <PendingListingsTable
                products={pendingProducts}
                isLoading={pendingLoading}
                error={null}
                searchQuery={searchQuery}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onView={(product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
                approvingProductId={approvingProductId}
              />
            )}
            {activeTab === "Active" && (
              <ActiveListingsTable
                products={activeProducts}
                isLoading={activeLoading}
                error={null}
                searchQuery={searchQuery}
                onView={(product: Product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
              />
            )}
            {activeTab === "Sold" && (
              <SoldListingsTable
                products={soldProducts}
                isLoading={soldLoading}
                error={null}
                searchQuery={searchQuery}
                onView={(product: Product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
              />
            )}
            {activeTab === "Rejected" && (
              <RejectedListingsTable
                products={rejectedProducts}
                isLoading={rejectedLoading}
                error={null}
                searchQuery={searchQuery}
                onView={(product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!statsLoading &&
        ((activeTab === "Pending" && pendingProducts.length > 0) ||
          (activeTab === "Active" && activeProducts.length > 0) ||
          (activeTab === "Sold" && soldProducts.length > 0) ||
          (activeTab === "Rejected" && rejectedProducts.length > 0)) && (
          <div className="mt-6 flex items-center justify-between">
            <Paragraph1 className="text-sm text-gray-600">
              {activeTab === "Pending" &&
                `Page ${pendingPage} of ${pendingTotalPages} • ${pendingTotal} pending products`}
              {activeTab === "Active" &&
                `Page ${activePage} of ${activeTotalPages} • ${activeTotal} active products`}
              {activeTab === "Sold" &&
                `Page ${soldPage} of ${soldTotalPages} • ${soldTotal} sold products`}
              {activeTab === "Rejected" &&
                `Page ${rejectedPage} of ${rejectedTotalPages} • ${rejectedTotal} rejected products`}
            </Paragraph1>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeTab === "Pending" && pendingPage > 1)
                    setPendingPage(pendingPage - 1);
                  if (activeTab === "Active" && activePage > 1)
                    setActivePage(activePage - 1);
                  if (activeTab === "Sold" && soldPage > 1)
                    setSoldPage(soldPage - 1);
                  if (activeTab === "Rejected" && rejectedPage > 1)
                    setRejectedPage(rejectedPage - 1);
                }}
                disabled={
                  (activeTab === "Pending" && pendingPage <= 1) ||
                  (activeTab === "Active" && activePage <= 1) ||
                  (activeTab === "Sold" && soldPage <= 1) ||
                  (activeTab === "Rejected" && rejectedPage <= 1)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm text-gray-700 bg-white"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <button
                onClick={() => {
                  if (
                    activeTab === "Pending" &&
                    pendingPage < pendingTotalPages
                  )
                    setPendingPage(pendingPage + 1);
                  if (activeTab === "Active" && activePage < activeTotalPages)
                    setActivePage(activePage + 1);
                  if (activeTab === "Sold" && soldPage < soldTotalPages)
                    setSoldPage(soldPage + 1);
                  if (
                    activeTab === "Rejected" &&
                    rejectedPage < rejectedTotalPages
                  )
                    setRejectedPage(rejectedPage + 1);
                }}
                disabled={
                  (activeTab === "Pending" &&
                    pendingPage >= pendingTotalPages) ||
                  (activeTab === "Active" && activePage >= activeTotalPages) ||
                  (activeTab === "Sold" && soldPage >= soldTotalPages) ||
                  (activeTab === "Rejected" &&
                    rejectedPage >= rejectedTotalPages)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm text-gray-700 bg-white"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      {/* Management Panel - Categories, Tags, Brands */}
      <ManagementPanel />

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListing(null);
          }}
          product={selectedListing}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
          onDisable={handleModalDisable}
          isApproving={approvingFromModalId === selectedListing.id}
          isRejecting={rejectingFromModalId === selectedListing.id}
          isDisabling={disablingFromModalId === selectedListing.id}
        />
      )}
    </div>
  );
}
