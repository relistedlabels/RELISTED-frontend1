// ENDPOINTS: GET /api/admin/users/:userId/listings
"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { UserListing } from "@/lib/api/admin/users";
import ListingDetailModal from "../../../listings/components/ListingDetailModal";

interface UserListingsProps {
  listings: UserListing[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-700";
    case "Pending":
      return "bg-yellow-50 text-yellow-700";
    case "Rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export default function UserListings({ listings }: UserListingsProps) {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewListing = (listing: UserListing) => {
    const detailedProduct = {
      id: listing.id,
      image: listing.image,
      itemName: listing.name,
      brand: listing.brand,
      category: listing.category,
      condition: "New",
      itemValue: `₦${listing.itemValue.toLocaleString()}`,
      pricePerDay: `₦${listing.dailyPrice.toLocaleString()}`,
      quantity: 1,
      description: `Beautiful ${listing.name} from ${listing.brand}. In ${listing.status} status with ${listing.totalRentals} total rentals.`,
      images: [listing.image, listing.image, listing.image, listing.image],
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
                Brand
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Item Value
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Price/Day
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Total Rentals
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Earnings
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
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      {listing.name}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-900">
                      {listing.brand}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-900">
                      {listing.category}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      ₦{listing.itemValue.toLocaleString()}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      ₦{listing.dailyPrice.toLocaleString()}
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
                    <Paragraph1 className="text-sm font-medium text-gray-900">
                      {listing.totalRentals}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm font-medium text-gray-900">
                      ₦{listing.earnings.toLocaleString()}
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
