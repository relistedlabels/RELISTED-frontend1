// ENDPOINTS: GET /api/admin/users/:userId/listings
"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { UserListing } from "@/lib/api/admin/users";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import ListingDetailModal from "../../../listings/components/ListingDetailModal";

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

// Product image row component
const ProductImageRow: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: product, isLoading, isError } = usePublicProductById(productId);

  // Extract first image from product attachments
  const firstImageUrl = product?.attachments?.uploads?.[0]?.url || undefined;

  return (
    <div className="w-16 h-16 rounded object-cover bg-gray-100 flex items-center justify-center overflow-hidden">
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : isError || !firstImageUrl ? (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-600">N/A</span>
        </div>
      ) : (
        <img
          src={firstImageUrl}
          alt="Product"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML =
                '<div class="w-full h-full bg-gray-300 flex items-center justify-center"><span class="text-xs text-gray-600">N/A</span></div>';
            }
          }}
        />
      )}
    </div>
  );
};

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

  return (
    <div>
      {selectedListing && (
        <ListingDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedListing}
        />
      )}

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
                Original Value
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Price/Day
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Quantity
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Date Added
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {listings && listings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center">
                  <Paragraph1 className="text-gray-500">
                    No listings found
                  </Paragraph1>
                </td>
              </tr>
            ) : (
              listings &&
              listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6">
                    <ProductImageRow productId={listing.id} />
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      {listing.name}
                    </Paragraph1>
                  </td>
                 
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      ₦{(listing.originalValue || 0).toLocaleString()}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      ₦{listing.dailyPrice.toLocaleString()}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-900">
                      {listing.quantity || 0}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        listing.status,
                      )}`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-900">
                      {new Date(listing.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleViewListing(listing)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
