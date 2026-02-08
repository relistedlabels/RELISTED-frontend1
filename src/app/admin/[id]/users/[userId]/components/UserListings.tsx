// ENDPOINTS: GET /api/admin/users/:userId/listings
"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ListingDetailModal from "../../../listings/components/ListingDetailModal";

interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  itemValue: number;
  dailyPrice: number;
  status: "Active" | "Pending" | "Rejected";
  dateAdded: string;
}

interface UserListingsProps {
  user: {
    name: string;
  };
}

// Demo listings data
const DEMO_LISTINGS: Product[] = [
  {
    id: "listing_001",
    name: "Hermès Birkin 30",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    brand: "Hermès",
    category: "Bags",
    itemValue: 12500000,
    dailyPrice: 85000,
    status: "Active",
    dateAdded: "Jan 15, 2025",
  },
  {
    id: "listing_002",
    name: "Louis Vuitton Pochette",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    brand: "Louis Vuitton",
    category: "Bags",
    itemValue: 8500000,
    dailyPrice: 60000,
    status: "Active",
    dateAdded: "Jan 10, 2025",
  },
  {
    id: "listing_003",
    name: "Gucci GG Marmont",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop",
    brand: "Gucci",
    category: "Bags",
    itemValue: 5500000,
    dailyPrice: 40000,
    status: "Pending",
    dateAdded: "Feb 01, 2025",
  },
  {
    id: "listing_004",
    name: "Chanel Classic Flap",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    brand: "Chanel",
    category: "Bags",
    itemValue: 9800000,
    dailyPrice: 70000,
    status: "Active",
    dateAdded: "Jan 20, 2025",
  },
];

export default function UserListings({ user }: UserListingsProps) {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewListing = (listing: Product) => {
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
      description: `Beautiful ${listing.name} from ${listing.brand}. In excellent condition and ready for rental.`,
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
                Added
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_LISTINGS.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center">
                  <Paragraph1 className="text-gray-500">
                    No listings found
                  </Paragraph1>
                </td>
              </tr>
            ) : (
              DEMO_LISTINGS.map((listing) => (
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
                    <Paragraph1 className="text-sm text-gray-600">
                      {listing.dateAdded}
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
