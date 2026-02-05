import React from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { UserProduct } from "@/lib/api/product";

interface RejectedListingsTableProps {
  products: UserProduct[];
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  onView: (product: UserProduct) => void;
}

export default function RejectedListingsTable({
  products,
  isLoading,
  error,
  searchQuery,
  onView,
}: RejectedListingsTableProps) {
  const getImageUrl = (listing: UserProduct): string => {
    if (listing.attachments?.uploads?.[0]?.url) {
      return listing.attachments.uploads[0].url;
    }
    return "https://via.placeholder.com/100?text=No+Image";
  };

  const filteredProducts = products.filter((product: UserProduct) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.curator.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading rejected products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load rejected products</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No rejected products found</p>
      </div>
    );
  }

  return (
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
              Rejection Reason
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product: UserProduct) => (
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
                <Paragraph1 className="text-sm text-red-600">
                  {(product as any).rejectionComment || "No reason provided"}
                </Paragraph1>
              </td>
              <td className="py-4 px-6">
                <button
                  onClick={() => onView(product)}
                  className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Eye size={18} />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
