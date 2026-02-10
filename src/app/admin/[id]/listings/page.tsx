"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useProductStatistics } from "@/lib/queries/product/useProductStatistics";
import {
  useApproveProduct,
  useRejectProduct,
} from "@/lib/mutations/product/useProductApproval";
import { UserProduct } from "@/lib/api/product";
import { useQueryClient } from "@tanstack/react-query";
import ListingDetailModal from "./components/ListingDetailModal";
import PendingListingsTable from "./components/PendingListingsTable";
import ApprovedListingsTable from "./components/ApprovedListingsTable";
import RejectedListingsTable from "./components/RejectedListingsTable";

type TabType = "Pending" | "Approved" | "Rejected";

export default function ListingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<UserProduct | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(
    null,
  );
  const [rejectionComment, setRejectionComment] = useState("");
  const [approvingProductId, setApprovingProductId] = useState<string | null>(
    null,
  );

  // Fetch all statistics from API - includes products for each status
  const { data: stats, isLoading: statsLoading } = useProductStatistics();

  const TABS: TabType[] = ["Pending", "Approved", "Rejected"];

  // Extract products from statistics for each tab
  const pendingProducts = useMemo(
    () => stats?.getPendingProducts?.products || [],
    [stats],
  );
  const approvedProducts = useMemo(
    () => stats?.getApprovedProducts?.products || [],
    [stats],
  );
  const rejectedProducts = useMemo(
    () => stats?.getRejectedProducts?.products || [],
    [stats],
  );

  // Mutations
  const approveMutation = useApproveProduct();
  const rejectMutation = useRejectProduct();

  const handleApprove = (productId: string) => {
    setApprovingProductId(productId);
    approveMutation.mutate(productId, {
      onSuccess: () => {
        setApprovingProductId(null);
        // Refetch statistics
        queryClient.invalidateQueries({
          queryKey: ["product", "statistics"],
        });
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
            // Refetch statistics
            queryClient.invalidateQueries({
              queryKey: ["product", "statistics"],
            });
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
          product={{
            id: selectedListing.id,
            image:
              selectedListing.attachments?.uploads?.[0]?.url ||
              "https://via.placeholder.com/100?text=No+Image",
            itemName: selectedListing.name,
            brand: selectedListing.subText,
            category: "Uncategorized",
            condition: selectedListing.condition || "Not Specified",
            itemValue: `₦${selectedListing.originalValue?.toLocaleString() || 0}`,
            pricePerDay: `₦${selectedListing.dailyPrice?.toLocaleString() || 0}`,
            quantity: selectedListing.quantity,
            description: selectedListing.description || "",
            images: selectedListing.attachments?.uploads?.map((u) => u.url) || [
              selectedListing.attachments?.uploads?.[0]?.url ||
                "https://via.placeholder.com/100?text=No+Image",
            ],
            status: selectedListing.productVerified ? "Active" : "Pending",
          }}
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

      {/* Top Bar - Search, Filter, Export */}
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
            {statsLoading ? "-" : stats?.getTotalProducts?.count || 0}
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
            {statsLoading ? "-" : stats?.getPendingProducts?.count || 0}
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
            {statsLoading ? "-" : stats?.getApprovedProducts?.count || 0}
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
            {statsLoading ? "-" : stats?.getRejectedProducts?.count || 0}
          </Paragraph3>
        </div>

        {/* Active Products */}
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
            {statsLoading ? "-" : stats?.getActiveProducts?.count || 0}
          </Paragraph3>
        </div>
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
        {activeTab === "Pending" && (
          <PendingListingsTable
            products={pendingProducts}
            isLoading={statsLoading}
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
            isLoading={statsLoading}
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
            isLoading={statsLoading}
            error={null}
            searchQuery={searchQuery}
            onView={(product) => {
              setSelectedListing(product);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Pagination Info */}
      {!statsLoading &&
        ((activeTab === "Pending" && pendingProducts.length > 0) ||
          (activeTab === "Approved" && approvedProducts.length > 0) ||
          (activeTab === "Rejected" && rejectedProducts.length > 0)) && (
          <div className="mt-6">
            <Paragraph1 className="text-sm text-gray-600">
              {activeTab === "Pending" &&
                `${pendingProducts.length} pending products`}
              {activeTab === "Approved" &&
                `${approvedProducts.length} approved products`}
              {activeTab === "Rejected" &&
                `${rejectedProducts.length} rejected products`}
            </Paragraph1>
          </div>
        )}
    </div>
  );
}
