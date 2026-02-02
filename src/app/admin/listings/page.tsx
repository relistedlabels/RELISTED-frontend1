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
import ListingDetailModal from "./components/ListingDetailModal";

interface Listing {
  id: string;
  image: string;
  itemName: string;
  brand: string;
  category: string;
  curator: {
    name: string;
    verified: boolean;
  };
  itemValue: string;
  pricePerDay: string;
  status: "Pending" | "Active" | "Rejected";
}

const LISTINGS: Listing[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop",
    itemName: "Hermès Birkin 30",
    brand: "Hermès",
    category: "Bags",
    curator: { name: "Blessing Okafor", verified: true },
    itemValue: "₦850,000",
    pricePerDay: "₦85,000",
    status: "Pending",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1543163521-9145f93210e6?w=100&h=100&fit=crop",
    itemName: "Louboutin So Kate Heels",
    brand: "Christian Louboutin",
    category: "Shoes",
    curator: { name: "Blessing Okafor", verified: true },
    itemValue: "₦220,000",
    pricePerDay: "₦22,000",
    status: "Pending",
  },
];

type TabType = "Pending" | "Active" | "Rejected";

const STATS = [
  {
    label: "Total Listings",
    value: "6",
    icon: Globe,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
  },
  {
    label: "Active",
    value: "2",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Pending",
    value: "2",
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    label: "Rejected",
    value: "1",
    icon: XCircle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
];

const TABS: TabType[] = ["Pending", "Active", "Rejected"];
const TAB_COUNTS: Record<TabType, number> = {
  Pending: 2,
  Active: 2,
  Rejected: 1,
};

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      {/* Modal */}
      <ListingDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={
          selectedListing
            ? {
                id: selectedListing.id,
                image: selectedListing.image,
                itemName: selectedListing.itemName,
                brand: selectedListing.brand,
                category: selectedListing.category,
                condition: "New",
                itemValue: "₦12,500,000",
                pricePerDay: selectedListing.pricePerDay,
                quantity: 1,
                description:
                  "Brand new " +
                  selectedListing.itemName +
                  " in classic black. Never worn. Comes with original box, dust bag, and authentication card. Investment-grade luxury piece.",
                images: [
                  selectedListing.image,
                  selectedListing.image,
                  selectedListing.image,
                  selectedListing.image,
                ],
                status: selectedListing.status,
              }
            : undefined
        }
      />

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
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-0 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-gray-900 border-black"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab} ({TAB_COUNTS[tab]})
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Category
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {LISTINGS.filter((l) => l.status === activeTab).map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6">
                    <img
                      src={listing.image}
                      alt={listing.itemName}
                      className="w-16 h-16 rounded object-cover"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      {listing.itemName}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-500">
                      {listing.brand}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-700">
                      {listing.category}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <Paragraph1 className="text-sm text-gray-900">
                          {listing.curator.name}
                        </Paragraph1>
                        {listing.curator.verified && (
                          <Paragraph1 className="text-xs text-green-600">
                            Verified
                          </Paragraph1>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      {listing.itemValue}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="font-medium text-gray-900">
                      {listing.pricePerDay}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        title="Approve"
                        className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        title="Reject"
                        className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <X size={18} />
                        Reject
                      </button>
                      <button
                        title="View"
                        onClick={() => {
                          setSelectedListing(listing);
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
      </div>
    </div>
  );
}
