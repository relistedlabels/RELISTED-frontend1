import React, { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { Product } from "@/lib/api/admin/listings";
import {
  AdminCuratorAvatar,
  AdminListingThumb,
  curatorAvatarUrl,
  listingThumbnailUrl,
} from "@/app/admin/lib/adminListingDisplay";
import { ApprovalConfirmationModal } from "./ApprovalConfirmationModal";
import ItemTypeBadge from "./ItemTypeBadge";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

interface PendingListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onView: (product: Product) => void;
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
  const [confirmingProduct, setConfirmingProduct] = useState<Product | null>(
    null,
  );

  const handleApproveClick = (product: Product) => {
    setConfirmingProduct(product);
  };

  const handleConfirmApprove = () => {
    if (confirmingProduct) {
      onApprove(confirmingProduct.id);
      setConfirmingProduct(null);
    }
  };

  const handleCancelApprove = () => {
    setConfirmingProduct(null);
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.curator?.name.toLowerCase().includes(searchQuery.toLowerCase());
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
              curator: product.curator
                ? { ...product.curator, isVerified: true }
                : undefined,
            };
            const priceInfo = listingPriceDisplay(
              safeProduct as typeof safeProduct & {
                listingType?: string;
                resalePrice?: number;
              },
            );
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
                  <div className="mt-2">
                    <ItemTypeBadge listingType={priceInfo.listingType} />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Paragraph1 className="text-sm text-gray-900">
                    {typeof safeProduct.category === "object" &&
                    safeProduct.category
                      ? (safeProduct.category as any)?.name || "N/A"
                      : (safeProduct.category as string) || "N/A"}
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
                  <Paragraph1 className="font-medium text-gray-900">
                    ₦{safeProduct.originalValue?.toLocaleString() || 0}
                  </Paragraph1>
                  {/* Show rent/resale prices if available */}
                  <div className="mt-1 space-y-1">
                      {priceInfo.listingType !== "RESALE" && (
                        <Paragraph1 className="text-xs text-gray-700">
                          {priceInfo.primary.label}: ₦
                          {priceInfo.primary.amount.toLocaleString()}
                        </Paragraph1>
                      )}
                      {(priceInfo.secondary || priceInfo.listingType === "RESALE") && (
                        <Paragraph1 className="text-xs text-gray-700">
                          {(priceInfo.secondary ?? priceInfo.primary).label}: ₦
                          {(priceInfo.secondary ?? priceInfo.primary).amount.toLocaleString()}
                        </Paragraph1>
                      )}
                    </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveClick(product)}
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
            );
          })}
        </tbody>
      </table>
      <ApprovalConfirmationModal
        isOpen={!!confirmingProduct}
        product={confirmingProduct}
        isLoading={approvingProductId === confirmingProduct?.id}
        onConfirm={handleConfirmApprove}
        onCancel={handleCancelApprove}
      />
    </div>
  );
}
