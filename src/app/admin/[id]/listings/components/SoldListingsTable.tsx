import React from "react";
import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { Product } from "@/lib/api/admin/listings";
import {
  AdminCuratorAvatar,
  AdminListingThumb,
  curatorAvatarUrl,
  listingThumbnailUrl,
} from "@/app/admin/lib/adminListingDisplay";
import ItemTypeBadge from "./ItemTypeBadge";

interface SoldListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  onView: (product: Product) => void;
}

function SoldListingsTable({
  products,
  isLoading,
  error,
  searchQuery,
  onView,
}: SoldListingsTableProps) {
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.curator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading sold products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load sold products</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No sold products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              IMAGE
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              ITEM NAME
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              CATEGORY
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              CURATOR
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              STATUS
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              PRICE
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product: Product) => {
            // Default type to RENTAL if not present, ensure curator is verified
            const safeProduct = {
              ...product,
              listingType: (product as any).listingType || "RENTAL",
              curator: product.curator
                ? { ...product.curator, isVerified: true }
                : undefined,
            };
            return (
              <tr
                key={safeProduct.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="py-4 px-6">
                  <AdminListingThumb
                    url={listingThumbnailUrl(product)}
                    alt={safeProduct.name}
                  />
                </td>
                <td className="py-4 px-6">
                  <Paragraph1 className="font-medium text-gray-900">
                    {safeProduct.name}
                  </Paragraph1>
                  {(safeProduct as any).brand && (
                    <Paragraph1 className="text-xs text-gray-500 mt-1">
                      {typeof (safeProduct as any).brand === "object"
                        ? (safeProduct as any).brand.name
                        : (safeProduct as any).brand}
                    </Paragraph1>
                  )}
                  {(safeProduct as any).listingType && (
                    <div className="mt-2">
                      <ItemTypeBadge
                        listingType={(safeProduct as any).listingType}
                      />
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <Paragraph1 className="text-sm text-gray-900">
                    {typeof (safeProduct as any).category === "object" &&
                    (safeProduct as any).category
                      ? ((safeProduct as any).category as any)?.name || "N/A"
                      : ((safeProduct as any).category as string) || "N/A"}
                  </Paragraph1>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <AdminCuratorAvatar
                      url={curatorAvatarUrl(safeProduct)}
                      name={safeProduct.curator?.name}
                    />
                    <div>
                      <Paragraph1 className="text-sm text-gray-900">
                        {safeProduct.curator?.name || "Unknown"}
                      </Paragraph1>
                      <span className="block text-xs text-green-600 font-medium">
                        Verified
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    Sold
                  </span>
                </td>
                <td className="py-4 px-6">
                  <Paragraph1 className="font-medium text-gray-900">
                    ₦{safeProduct.originalValue?.toLocaleString() || 0}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(SoldListingsTable);
