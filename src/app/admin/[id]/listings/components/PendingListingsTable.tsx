import React from "react";
import { Check, X, Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { UserProduct } from "@/lib/api/product";

interface PendingListingsTableProps {
  products: UserProduct[];
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onView: (product: UserProduct) => void;
  approvingProductId?: string | null;
}

export default function PendingListingsTable({
  products,
  isLoading,
  error,
  searchQuery,
  onApprove,
  onReject,
  onView,
  approvingProductId,
}: PendingListingsTableProps) {
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
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No pending products found</p>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove(product.id)}
                    disabled={approvingProductId === product.id}
                    className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  >
                    <Check size={18} />
                    {approvingProductId === product.id
                      ? "Approving..."
                      : "Approve"}
                  </button>
                  <button
                    onClick={() => onReject(product.id)}
                    className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <X size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => onView(product)}
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
  );
}
