"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Power,
  RotateCcw,
} from "lucide-react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { AdminSectionTabs } from "../../components/AdminSectionTabs";
import ListingDetailModal from "./components/ListingDetailModal";
import PendingListingsTable from "./components/PendingListingsTable";
import ActiveListingsTable from "./components/ActiveListingsTable";
import SoldListingsTable from "./components/SoldListingsTable";
import RejectedListingsTable from "./components/RejectedListingsTable";
import ManagementPanel from "./components/ManagementPanel";
import ListingFilterPanel, {
  ListingFilterButton,
} from "@/app/shop/components/ListingFilterPanel";
import type { ListingFilterValues } from "@/lib/shop/listingFilters";
import { pickerFiltersToApiParams } from "@/lib/shop/listingFilters";
import { countActiveListingFilters } from "@/lib/shop/countActiveListingFilters";
import {
  useListingsStatistics,
  useApproveListing,
  useRejectListing,
  useSendProductToPending,
  useSetAvailability,
  usePendingProducts,
  useActiveProducts,
  useRentedProducts,
  useInactiveProducts,
  useRejectedProducts,
  useBulkDeactivate,
  useBulkReactivate,
} from "@/lib/queries/admin/useListings";
import { Product, ProductDetail } from "@/lib/api/admin/listings";

type TabType =
  | "Pending"
  | "Active"
  | "Rented"
  | "Sold"
  | "Inactive"
  | "Rejected";

const LIST_PAGE_SIZE = 20;

export default function ListingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listingFilters, setListingFilters] = useState<ListingFilterValues>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [approvingFromModalId, setApprovingFromModalId] = useState<
    string | null
  >(null);
  const [rejectingFromModalId, setRejectingFromModalId] = useState<
    string | null
  >(null);

  const [deactivatingProductId, setDeactivatingProductId] = useState<
    string | null
  >(null);
  const [reactivatingProductId, setReactivatingProductId] = useState<
    string | null
  >(null);
  const [sendingToPendingFromModalId, setSendingToPendingFromModalId] =
    useState<string | null>(null);
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
  const [rentedPage, setRentedPage] = useState(1);
  const [soldPage, setSoldPage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);

  // Fetch all statistics from API
  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
  } = useListingsStatistics();

  // Get stats data from the response
  const stats = statsResponse?.data;
  const listingStats = [
    {
      label: "Total Listings",
      value: stats?.getTotalProducts?.count || 0,
      icon: Globe,
      iconColor: "text-gray-700",
      iconBackground: "bg-gray-100",
    },
    {
      label: "Pending Review",
      value: stats?.getPendingProducts?.count || 0,
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      iconBackground: "bg-yellow-50",
    },
    {
      label: "Active",
      value: stats?.getActiveProducts?.count || 0,
      icon: CheckCircle,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
    },
    {
      label: "Approved",
      value: stats?.getApprovedProducts?.count || 0,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBackground: "bg-green-50",
    },
    {
      label: "Rejected",
      value: stats?.getRejectedProducts?.count || 0,
      icon: XCircle,
      iconColor: "text-red-600",
      iconBackground: "bg-red-50",
    },
  ];

  if (statsError) {
    console.error("Failed to load product statistics:", statsError);
  }

  const TABS: TabType[] = [
    "Pending",
    "Active",
    "Rented",
    "Sold",
    "Inactive",
    "Rejected",
  ];

  const supportsBulkSelection =
    activeTab === "Active" ||
    activeTab === "Inactive" ||
    activeTab === "Rejected";

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setPendingPage(1);
    setActivePage(1);
    setRentedPage(1);
    setSoldPage(1);
    setInactivePage(1);
    setRejectedPage(1);
  }, [debouncedSearch, listingFilters]);

  const listingFilterParams = useMemo(
    () => pickerFiltersToApiParams(listingFilters),
    [listingFilters],
  );

  const pendingListParams = useMemo(
    () => ({
      page: pendingPage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [pendingPage, debouncedSearch, listingFilterParams],
  );
  const activeListParams = useMemo(
    () => ({
      page: activePage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [activePage, debouncedSearch, listingFilterParams],
  );
  const rentedListParams = useMemo(
    () => ({
      page: rentedPage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [rentedPage, debouncedSearch, listingFilterParams],
  );
  const soldListParams = useMemo(
    () => ({
      page: soldPage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [soldPage, debouncedSearch, listingFilterParams],
  );
  const inactiveListParams = useMemo(
    () => ({
      page: inactivePage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [inactivePage, debouncedSearch, listingFilterParams],
  );
  const rejectedListParams = useMemo(
    () => ({
      page: rejectedPage,
      count: LIST_PAGE_SIZE,
      search: debouncedSearch || undefined,
      ...listingFilterParams,
    }),
    [rejectedPage, debouncedSearch, listingFilterParams],
  );

  const { data: pendingResponse, isLoading: pendingLoading } =
    usePendingProducts(pendingListParams, activeTab === "Pending");
  const { data: activeResponse, isLoading: activeLoading } = useActiveProducts(
    activeListParams,
    activeTab === "Active",
  );
  const { data: rentedResponse, isLoading: rentedLoading } = useRentedProducts(
    rentedListParams,
    activeTab === "Rented",
  );
  const { data: soldResponse, isLoading: soldLoading } = useActiveProducts(
    soldListParams,
    activeTab === "Sold",
  );
  const { data: inactiveResponse, isLoading: inactiveLoading } =
    useInactiveProducts(inactiveListParams, activeTab === "Inactive");
  const { data: rejectedResponse, isLoading: rejectedLoading } =
    useRejectedProducts(rejectedListParams, activeTab === "Rejected");

  const pendingProducts = pendingResponse?.data?.products || [];
  const activeProducts = activeResponse?.data?.products || [];
  const rentedProducts = rentedResponse?.data?.products || [];
  const soldProducts = soldResponse?.data?.products || [];
  const inactiveProducts = inactiveResponse?.data?.products || [];
  const rejectedProducts = rejectedResponse?.data?.products || [];

  // Pagination data
  const pendingTotal = pendingResponse?.data?.total || 0;
  const pendingTotalPages = pendingResponse?.data?.totalPages || 1;
  const activeTotal = activeResponse?.data?.total || 0;
  const activeTotalPages = activeResponse?.data?.totalPages || 1;
  const rentedTotal = rentedResponse?.data?.total || 0;
  const rentedTotalPages = rentedResponse?.data?.totalPages || 1;
  const soldTotal = soldResponse?.data?.total || 0;
  const soldTotalPages = soldResponse?.data?.totalPages || 1;
  const inactiveTotal = inactiveResponse?.data?.total || 0;
  const inactiveTotalPages = inactiveResponse?.data?.totalPages || 1;
  const rejectedTotal = rejectedResponse?.data?.total || 0;
  const rejectedTotalPages = rejectedResponse?.data?.totalPages || 1;

  // Mutations
  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();
  const sendToPendingMutation = useSendProductToPending();
  const setAvailabilityMutation = useSetAvailability();
  const bulkDeactivateMutation = useBulkDeactivate();
  const bulkReactivateMutation = useBulkReactivate();

  const handleApprove = (productId: string) => {
    setApprovingProductId(productId);

    // Prepare query key for cache update
    const queryKey = ["admin", "products", "pending", pendingListParams];

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
      const queryKey = ["admin", "products", "pending", pendingListParams];

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
    const queryKey = ["admin", "products", "pending", pendingListParams];
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
    const queryKey = ["admin", "products", "pending", pendingListParams];
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

  const handleModalSendToPending = (productId: string) => {
    setSendingToPendingFromModalId(productId);
    const queryKey = ["admin", "products", "active", activeListParams];
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

    sendToPendingMutation.mutate(productId, {
      onSuccess: (response) => {
        setSendingToPendingFromModalId(null);
        setIsModalOpen(false);
        setSelectedListing(null);
        const message =
          (response as any)?.message || "Product reverted to pending!";
        toast.success(message);
      },
      onError: (error: any) => {
        setSendingToPendingFromModalId(null);
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to revert product to pending";
        toast.error(errorMessage);
      },
    });
  };

  const handleDeactivate = (productId: string) => {
    const product = activeProducts.find((item) => item.id === productId);
    const productName = product?.name || "this listing";
    if (
      !window.confirm(
        `Deactivate "${productName}"? It will be hidden from the shop.`,
      )
    ) {
      return;
    }

    setDeactivatingProductId(productId);
    bulkDeactivateMutation.mutate([productId], {
      onSuccess: (response) => {
        setDeactivatingProductId(null);
        toast.success(response.message || 'Listing deactivated successfully');
      },
      onError: (error: any) => {
        setDeactivatingProductId(null);
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to deactivate listing';
        toast.error(errorMessage);
      },
    });
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.size === 0) return;
    
    if (
      !window.confirm(
        `Deactivate ${selectedIds.size} listing${selectedIds.size > 1 ? 's' : ''}? You can reactivate them from the Inactive tab.`,
      )
    ) {
      return;
    }

    bulkDeactivateMutation.mutate(Array.from(selectedIds), {
      onSuccess: (response) => {
        toast.success(response.message || 'Listings deactivated successfully');
        setSelectedIds(new Set());
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to deactivate listings';
        toast.error(errorMessage);
      },
    });
  };

  const handleFilterApply = (filters: ListingFilterValues) => {
    setListingFilters(filters);
  };

  const handleFilterClear = () => {
    setListingFilters({});
    setSelectedIds(new Set());
  };

  const handleBulkReactivate = () => {
    if (selectedIds.size === 0) return;
    
    if (
      !window.confirm(
        `Reactivate ${selectedIds.size} listing${selectedIds.size > 1 ? 's' : ''}?`,
      )
    ) {
      return;
    }

    bulkReactivateMutation.mutate(Array.from(selectedIds), {
      onSuccess: (response) => {
        toast.success(response.message || 'Listings reactivated successfully');
        setSelectedIds(new Set());
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to reactivate listings';
        toast.error(errorMessage);
      },
    });
  };

  const handleReactivate = (productId: string) => {
    const product =
      inactiveProducts.find((item) => item.id === productId) ??
      rejectedProducts.find((item) => item.id === productId);
    const productName = product?.name || "this listing";
    if (
      !window.confirm(
        `Reactivate "${productName}"?`,
      )
    ) {
      return;
    }

    setReactivatingProductId(productId);
    bulkReactivateMutation.mutate([productId], {
      onSuccess: (response) => {
        setReactivatingProductId(null);
        toast.success(response.message || 'Listing reactivated successfully');
      },
      onError: (error: any) => {
        setReactivatingProductId(null);
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to reactivate listing';
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen">
      {/* Filter Panel */}
      <ListingFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        mode="controlled"
        value={listingFilters}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        hideSearch
        filterOptionsScope="admin-picker"
      />

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

      <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <ListingFilterButton
            onClick={() => setIsFilterOpen(true)}
            activeCount={countActiveListingFilters(listingFilters)}
            compactOnMobile
            className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-0 text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:w-auto sm:px-4"
          />
        </div>

        {/* Category Dropdown and Export */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {supportsBulkSelection && selectedIds.size > 0 && (
            <>
              {activeTab === "Active" && (
                <button
                  onClick={handleBulkDeactivate}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                >
                  <Power size={18} />
                  Deactivate ({selectedIds.size})
                </button>
              )}
              {(activeTab === "Inactive" || activeTab === "Rejected") && (
                <button
                  onClick={handleBulkReactivate}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                >
                  <RotateCcw size={18} />
                  Reactivate ({selectedIds.size})
                </button>
              )}
            </>
          )}
          <button className="flex- hidden items-center justify-center gap-2 px-4 py-2 border border-gray-800 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium text-sm bg-white">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:mb-8 lg:grid-cols-5 lg:gap-4">
        {statsLoading || statsError
          ? Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex h-[76px] animate-pulse items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:h-24 lg:p-4"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-5 w-12 rounded bg-gray-200" />
                </div>
              </div>
            ))
          : listingStats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:flex-col lg:items-start lg:p-6"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg lg:mb-3 lg:h-12 lg:w-12 ${stat.iconBackground}`}
                >
                  <stat.icon size={20} className={stat.iconColor} />
                </div>
                <div className="min-w-0">
                  <Paragraph1 className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                    {stat.label}
                  </Paragraph1>
                  <Paragraph3 className="mt-0.5 text-xl font-bold text-gray-900 lg:text-3xl">
                    {stat.value}
                  </Paragraph3>
                </div>
              </div>
            ))}
      </div>

      <AdminSectionTabs
        className="mb-6"
        tabs={TABS.map((tab) => ({ id: tab, label: tab }))}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab as TabType);
          setSelectedIds(new Set());
        }}
      />

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
                onView={(product: Product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
                onDeactivate={handleDeactivate}
                deactivatingProductId={deactivatingProductId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSelection={supportsBulkSelection}
              />
            )}
            {activeTab === "Rented" && (
              <ActiveListingsTable
                products={rentedProducts}
                isLoading={rentedLoading}
                error={null}
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
                onView={(product: Product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
              />
            )}
            {activeTab === "Inactive" && (
              <ActiveListingsTable
                products={inactiveProducts}
                isLoading={inactiveLoading}
                error={null}
                emptyMessage="No inactive listings found"
                onView={(product: Product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
                onReactivate={handleReactivate}
                reactivatingProductId={reactivatingProductId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSelection={supportsBulkSelection}
              />
            )}
            {activeTab === "Rejected" && (
              <RejectedListingsTable
                products={rejectedProducts}
                isLoading={rejectedLoading}
                error={null}
                onView={(product) => {
                  setSelectedListing(product);
                  setIsModalOpen(true);
                }}
                onReactivate={handleReactivate}
                reactivatingProductId={reactivatingProductId}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSelection={supportsBulkSelection}
              />
            )}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!statsLoading &&
        ((activeTab === "Pending" && pendingTotal > 0) ||
          (activeTab === "Active" && activeTotal > 0) ||
          (activeTab === "Rented" && rentedTotal > 0) ||
          (activeTab === "Sold" && soldTotal > 0) ||
          (activeTab === "Inactive" && inactiveTotal > 0) ||
          (activeTab === "Rejected" && rejectedTotal > 0)) && (
          <div className="mt-6 flex items-center justify-between">
            <Paragraph1 className="text-sm text-gray-600">
              {activeTab === "Pending" &&
                `Page ${pendingPage} of ${pendingTotalPages} • ${pendingTotal} pending products`}
              {activeTab === "Active" &&
                `Page ${activePage} of ${activeTotalPages} • ${activeTotal} active products`}
              {activeTab === "Rented" &&
                `Page ${rentedPage} of ${rentedTotalPages} • ${rentedTotal} rented products`}
              {activeTab === "Sold" &&
                `Page ${soldPage} of ${soldTotalPages} • ${soldTotal} sold products`}
              {activeTab === "Inactive" &&
                `Page ${inactivePage} of ${inactiveTotalPages} • ${inactiveTotal} inactive listings`}
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
                  if (activeTab === "Rented" && rentedPage > 1)
                    setRentedPage(rentedPage - 1);
                  if (activeTab === "Sold" && soldPage > 1)
                    setSoldPage(soldPage - 1);
                  if (activeTab === "Inactive" && inactivePage > 1)
                    setInactivePage(inactivePage - 1);
                  if (activeTab === "Rejected" && rejectedPage > 1)
                    setRejectedPage(rejectedPage - 1);
                }}
                disabled={
                  (activeTab === "Pending" && pendingPage <= 1) ||
                  (activeTab === "Active" && activePage <= 1) ||
                  (activeTab === "Rented" && rentedPage <= 1) ||
                  (activeTab === "Sold" && soldPage <= 1) ||
                  (activeTab === "Inactive" && inactivePage <= 1) ||
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
                  if (activeTab === "Rented" && rentedPage < rentedTotalPages)
                    setRentedPage(rentedPage + 1);
                  if (activeTab === "Sold" && soldPage < soldTotalPages)
                    setSoldPage(soldPage + 1);
                  if (
                    activeTab === "Inactive" &&
                    inactivePage < inactiveTotalPages
                  )
                    setInactivePage(inactivePage + 1);
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
                  (activeTab === "Rented" && rentedPage >= rentedTotalPages) ||
                  (activeTab === "Sold" && soldPage >= soldTotalPages) ||
                  (activeTab === "Inactive" &&
                    inactivePage >= inactiveTotalPages) ||
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
          onSendToPending={handleModalSendToPending}
          isApproving={approvingFromModalId === selectedListing.id}
          isRejecting={rejectingFromModalId === selectedListing.id}
          isSendingToPending={
            sendingToPendingFromModalId === selectedListing.id
          }
        />
      )}
    </div>
  );
}
