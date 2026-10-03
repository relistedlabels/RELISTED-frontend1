// ENDPOINTS: GET /api/admin/users/:userId/listings
"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { UserListing } from "@/lib/api/admin/users";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import ListingDetailModal from "../../../listings/components/ListingDetailModal";
import { firstProductAttachmentImageUrl } from "@/lib/product/sortProductAttachmentUploads";

interface UserListingsProps {
  listings: UserListing[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "APPROVED":
      return "bg-blue-50 text-blue-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const ProductImageRow: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: product, isLoading, isError } = usePublicProductById(productId);
  const firstImageUrl = firstProductAttachmentImageUrl(
    product?.attachments?.uploads,
  );

  return (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100 object-cover">
      {isLoading ? (
        <div className="h-full w-full animate-pulse bg-gray-200" />
      ) : isError || !firstImageUrl ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-300">
          <span className="text-xs text-gray-600">N/A</span>
        </div>
      ) : (
        <img
          src={firstImageUrl}
          alt="Product"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
};

function buildColumns(
  onViewListing: (listing: UserListing) => void,
): ResponsiveColumnDef<UserListing>[] {
  return [
    {
      id: "image",
      header: "Image",
      mobile: "hidden",
      render: (listing) => <ProductImageRow productId={listing.id} />,
    },
    {
      id: "itemName",
      header: "Item Name",
      mobile: "primary",
      render: (listing) => (
        <Paragraph1 className="font-medium text-gray-900">{listing.name}</Paragraph1>
      ),
    },
    {
      id: "originalValue",
      header: "Original Value",
      mobile: "detail",
      render: (listing) => (
        <Paragraph1 className="font-medium text-gray-900">
          ₦{(listing.originalValue || 0).toLocaleString()}
        </Paragraph1>
      ),
    },
    {
      id: "pricePerDay",
      header: "Price/Day",
      mobile: "detail",
      render: (listing) => (
        <Paragraph1 className="font-medium text-gray-900">
          ₦{listing.dailyPrice.toLocaleString()}
        </Paragraph1>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      mobile: "detail",
      render: (listing) => (
        <Paragraph1 className="text-sm text-gray-900">
          {listing.quantity || 0}
        </Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (listing) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(listing.status)}`}
        >
          {listing.status}
        </span>
      ),
    },
    {
      id: "dateAdded",
      header: "Date Added",
      mobile: "detail",
      render: (listing) => (
        <Paragraph1 className="text-sm text-gray-900">
          {new Date(listing.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </Paragraph1>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (listing) => (
        <button
          type="button"
          onClick={() => onViewListing(listing)}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Eye size={18} />
          View
        </button>
      ),
    },
  ];
}

export default function UserListings({ listings }: UserListingsProps) {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewListing = (listing: UserListing) => {
    const detailedProduct = {
      id: listing.id,
      itemName: listing.name,
      color: listing.color,
      condition: listing.condition || "Not specified",
      itemValue: `₦${(listing.originalValue || 0).toLocaleString()}`,
      pricePerDay: `₦${listing.dailyPrice.toLocaleString()}`,
      quantity: listing.quantity || 1,
      description:
        listing.description ||
        `Beautiful ${listing.name}. In ${listing.status} status.`,
      status: listing.status,
    };
    setSelectedListing(detailedProduct);
    setIsModalOpen(true);
  };

  const columns = buildColumns(handleViewListing);

  return (
    <div>
      {selectedListing && (
        <ListingDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedListing}
        />
      )}

      <ResponsiveDataTable
        rows={listings ?? []}
        columns={columns}
        getRowKey={(listing) => listing.id}
        emptyState={
          <Paragraph1 className="py-8 text-center text-gray-500">
            No listings found
          </Paragraph1>
        }
      />
    </div>
  );
}
