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
import { TableSkeleton, StatCardSkeleton } from "@/common/ui/SkeletonLoaders";
import ListingDetailModal from "./components/ListingDetailModal";
import PendingListingsTable from "./components/PendingListingsTable";
import ApprovedListingsTable from "./components/ApprovedListingsTable";
import RejectedListingsTable from "./components/RejectedListingsTable";
import ManagementPanel from "./components/ManagementPanel";
import {
  useListingsStatistics,
  useApproveListing,
  useRejectListing,
  usePendingProducts,
  useApprovedProducts,
  useActiveProducts,
  useRejectedProducts,
} from "@/lib/queries/admin/useListings";
import { Product, ProductDetail } from "@/lib/api/admin/listings";

type TabType = "Pending" | "Approved" | "Active" | "Rejected";

export default function ListingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(
    null,
  );
  const [rejectionComment, setRejectionComment] = useState("");
  const [approvingProductId, setApprovingProductId] = useState<string | null>(
    null,
  );

  // Pagination state for each tab
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
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

  const TABS: TabType[] = ["Pending", "Approved", "Active", "Rejected"];

  // Fetch products for each tab
  const { data: pendingResponse, isLoading: pendingLoading } =
    usePendingProducts({
      page: pendingPage,
      count: 20,
    });
  const { data: approvedResponse, isLoading: approvedLoading } =
    useApprovedProducts({
      page: approvedPage,
      count: 20,
    });
  const { data: activeResponse, isLoading: activeLoading } = useActiveProducts({
    page: activePage,
    count: 20,
  });
  const { data: rejectedResponse, isLoading: rejectedLoading } =
    useRejectedProducts({
      page: rejectedPage,
      count: 20,
    });

  const pendingProducts = pendingResponse?.data?.products || [];
  const approvedProducts = approvedResponse?.data?.products || [];
  const activeProducts = activeResponse?.data?.products || [];
  const rejectedProducts = rejectedResponse?.data?.products || [];

  // Pagination data
  const pendingTotal = pendingResponse?.data?.total || 0;
  const pendingTotalPages = pendingResponse?.data?.totalPages || 1;
  const approvedTotal = approvedResponse?.data?.total || 0;
  const approvedTotalPages = approvedResponse?.data?.totalPages || 1;
  const activeTotal = activeResponse?.data?.total || 0;
  const activeTotalPages = activeResponse?.data?.totalPages || 1;
  const rejectedTotal = rejectedResponse?.data?.total || 0;
  const rejectedTotalPages = rejectedResponse?.data?.totalPages || 1;

  // Mutations
  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();

  const handleApprove = (productId: string) => {
    setApprovingProductId(productId);
    approveMutation.mutate(productId, {
      onSuccess: () => {
        setApprovingProductId(null);
      },
      onError: () => {
        setApprovingProductId(null);
      },
    });
  };

  const handleRejectClick = (productId: string) => {
    setRejectingProductId(productId);
    setRejectionComment("");
  };

  const handleConfirmReject = () => {
    if (rejectingProductId && rejectionComment.trim()) {
      rejectMutation.mutate(
        {
          productId: rejectingProductId,
          rejectionComment,
        },
        {
          onSuccess: () => {
            setRejectingProductId(null);
            setRejectionComment("");
          },
          onError: () => {
            setRejectingProductId(null);
          },
        },
      );
    }
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
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-800 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium text-sm bg-white">
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
            {activeTab === "Approved" && (
              <ApprovedListingsTable
                products={approvedProducts}
                isLoading={approvedLoading}
                error={null}
                searchQuery={searchQuery}
                onView={(product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
              />
            )}
            {activeTab === "Active" && (
              <ApprovedListingsTable
                products={activeProducts}
                isLoading={activeLoading}
                error={null}
                searchQuery={searchQuery}
                onView={(product) => {
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
          (activeTab === "Approved" && approvedProducts.length > 0) ||
          (activeTab === "Active" && activeProducts.length > 0) ||
          (activeTab === "Rejected" && rejectedProducts.length > 0)) && (
          <div className="mt-6 flex items-center justify-between">
            <Paragraph1 className="text-sm text-gray-600">
              {activeTab === "Pending" &&
                `Page ${pendingPage} of ${pendingTotalPages} • ${pendingTotal} pending products`}
              {activeTab === "Approved" &&
                `Page ${approvedPage} of ${approvedTotalPages} • ${approvedTotal} approved products`}
              {activeTab === "Active" &&
                `Page ${activePage} of ${activeTotalPages} • ${activeTotal} active products`}
              {activeTab === "Rejected" &&
                `Page ${rejectedPage} of ${rejectedTotalPages} • ${rejectedTotal} rejected products`}
            </Paragraph1>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeTab === "Pending" && pendingPage > 1)
                    setPendingPage(pendingPage - 1);
                  if (activeTab === "Approved" && approvedPage > 1)
                    setApprovedPage(approvedPage - 1);
                  if (activeTab === "Active" && activePage > 1)
                    setActivePage(activePage - 1);
                  if (activeTab === "Rejected" && rejectedPage > 1)
                    setRejectedPage(rejectedPage - 1);
                }}
                disabled={
                  (activeTab === "Pending" && pendingPage <= 1) ||
                  (activeTab === "Approved" && approvedPage <= 1) ||
                  (activeTab === "Active" && activePage <= 1) ||
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
                  if (
                    activeTab === "Approved" &&
                    approvedPage < approvedTotalPages
                  )
                    setApprovedPage(approvedPage + 1);
                  if (activeTab === "Active" && activePage < activeTotalPages)
                    setActivePage(activePage + 1);
                  if (
                    activeTab === "Rejected" &&
                    rejectedPage < rejectedTotalPages
                  )
                    setRejectedPage(rejectedPage + 1);
                }}
                disabled={
                  (activeTab === "Pending" &&
                    pendingPage >= pendingTotalPages) ||
                  (activeTab === "Approved" &&
                    approvedPage >= approvedTotalPages) ||
                  (activeTab === "Active" && activePage >= activeTotalPages) ||
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
    </div>
  );
}
