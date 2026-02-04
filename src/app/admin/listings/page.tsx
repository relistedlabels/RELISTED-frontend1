"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { usePendingProducts } from "@/lib/queries/product/usePendingProducts";
import {
  useApproveProduct,
  useRejectProduct,
} from "@/lib/mutations/product/useProductApproval";
import ListingDetailModal from "./components/ListingDetailModal";

interface ListingData {
  id: string;
  name: string;
  subText: string;
  description: string;
  condition: string;
  dailyPrice: number;
  originalValue: number;
  quantity: number;
  status: string;
  productVerified: boolean;
  isActive: boolean;
  curator: {
    name: string;
    id: string;
  };
  attachments: {
    uploads: Array<{ url: string }>;
  } | null;
  categoryId?: string | null;
  brandId?: string | null;
}

type TabType = "Pending" | "Approved" | "Rejected";

const STATS = [
  {
    label: "Total Listings",
    value: "24",
    icon: Globe,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
  },
  {
    label: "Pending Review",
    value: "8",
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    label: "Approved",
    value: "14",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Rejected",
    value: "2",
    icon: XCircle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
];

const TABS: TabType[] = ["Pending", "Approved", "Rejected"];

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(
    null,
  );
  const [rejectionComment, setRejectionComment] = useState("");
  const [page, setPage] = useState(1);

  // Fetch pending products
  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
  } = usePendingProducts(page, 10);
  const pendingProducts = pendingData?.data || [];

  // Mutations
  const approveMutation = useApproveProduct();
  const rejectMutation = useRejectProduct();

  const getImageUrl = (listing: ListingData): string => {
    if (listing.attachments?.uploads?.[0]?.url) {
      return listing.attachments.uploads[0].url;
    }
    return "https://via.placeholder.com/100?text=No+Image";
  };

  const handleApprove = (productId: string) => {
    approveMutation.mutate(productId, {
      onSuccess: () => {
        setPage(1);
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
            setPage(1);
          },
        },
      );
    }
  };

  const getDisplayProducts = (): ListingData[] => {
    const allProducts = pendingProducts;

    return allProducts.filter((product) => {
      const matchesTab =
        activeTab === "Pending" ||
        (activeTab === "Approved" && product.productVerified) ||
        (activeTab === "Rejected" && !product.productVerified);

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.curator.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
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
            image: getImageUrl(selectedListing),
            itemName: selectedListing.name,
            brand: selectedListing.subText,
            category: selectedListing.categoryId || "Uncategorized",
            condition: selectedListing.condition,
            itemValue: `₦${selectedListing.originalValue?.toLocaleString() || 0}`,
            pricePerDay: `₦${selectedListing.dailyPrice?.toLocaleString() || 0}`,
            quantity: selectedListing.quantity,
            description: selectedListing.description,
            images: selectedListing.attachments?.uploads?.map((u) => u.url) || [
              getImageUrl(selectedListing),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <IconComponent size={24} className={stat.iconColor} />
                </div>
              </div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {stat.label}
              </Paragraph1>
              <Paragraph3 className="text-3xl font-bold text-gray-900">
                {stat.value}
              </Paragraph3>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
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
        {pendingLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : pendingError ? (
          <div className="p-8 text-center">
            <p className="text-red-500">Failed to load products</p>
          </div>
        ) : getDisplayProducts().length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Image
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Item Name
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Curator
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Item Value
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Price / Day
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getDisplayProducts().map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6">
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="font-medium text-gray-900">
                        {product.name}
                      </Paragraph1>
                      <Paragraph1 className="text-xs text-gray-500">
                        {product.subText}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm text-gray-900">
                        {product.curator.name}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="font-medium text-gray-900">
                        ₦{product.originalValue?.toLocaleString() || 0}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="font-medium text-gray-900">
                        ₦{product.dailyPrice?.toLocaleString() || 0}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.productVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {product.productVerified ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {activeTab === "Pending" &&
                          !product.productVerified && (
                            <>
                              <button
                                onClick={() => handleApprove(product.id)}
                                disabled={approveMutation.isPending}
                                className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                              >
                                <Check size={18} />
                                {approveMutation.isPending
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => handleRejectClick(product.id)}
                                className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                              >
                                <X size={18} />
                                Reject
                              </button>
                            </>
                          )}
                        <button
                          onClick={() => {
                            setSelectedListing(product);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <Eye size={18} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!pendingLoading && pendingProducts.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <Paragraph1 className="text-sm text-gray-600">
            Page {page} of {Math.ceil((pendingProducts.length || 0) / 10)}
          </Paragraph1>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
