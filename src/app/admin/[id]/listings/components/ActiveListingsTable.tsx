import React from "react";
import { Eye, Power, Check, Square, RotateCcw } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { Product } from "@/lib/api/admin/listings";
import {
  AdminCuratorAvatar,
  AdminListingThumb,
  curatorAvatarUrl,
  listingThumbnailUrl,
} from "@/app/admin/lib/adminListingDisplay";
import ItemTypeBadge from "./ItemTypeBadge";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";
import { canDeactivateListing } from "@/lib/admin/listingDeactivate";

interface ActiveListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onView: (product: Product) => void;
  onDeactivate?: (productId: string) => void;
  deactivatingProductId?: string | null;
  onReactivate?: (productId: string) => void;
  reactivatingProductId?: string | null;
  emptyMessage?: string;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  showSelection?: boolean;
}

function ActiveListingsTable({
  products,
  isLoading,
  error,
  onView,
  onDeactivate,
  deactivatingProductId,
  onReactivate,
  reactivatingProductId,
  emptyMessage = "No active products found",
  selectedIds = new Set(),
  onSelectionChange,
  showSelection = false,
}: ActiveListingsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(products.map((p) => p.id));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectOne = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    onSelectionChange?.(newSelected);
  };

  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0 && !allSelected;
  if (isLoading && products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading active products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load active products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-gray-200 border-b">
            {showSelection && (
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
              </th>
            )}
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              IMAGE
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              ITEM NAME
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              CATEGORY
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              CURATOR
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              AVAILABILITY
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              PRICE
            </th>
            <th className="px-6 py-4 font-semibold text-gray-600 text-xs text-left uppercase tracking-wide">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => {
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
                className="hover:bg-gray-50 border-gray-200 border-b transition"
              >
                {showSelection && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(safeProduct.id)}
                      onChange={(e) => handleSelectOne(safeProduct.id, e.target.checked)}
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <AdminListingThumb
                    url={listingThumbnailUrl(product)}
                    alt={safeProduct.name}
                  />
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="font-medium text-gray-900">
                    {safeProduct.name}
                  </Paragraph1>
                  {(safeProduct as any).brand && (
                    <Paragraph1 className="mt-1 text-gray-500 text-xs">
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
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-900 text-sm">
                    {typeof safeProduct.category === "object" &&
                    safeProduct.category
                      ? (safeProduct.category as any)?.name || "N/A"
                      : (safeProduct.category as string) || "N/A"}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <AdminCuratorAvatar
                      url={curatorAvatarUrl(safeProduct)}
                      name={safeProduct.curator?.name}
                    />
                    <div>
                      <Paragraph1 className="text-gray-900 text-sm">
                        {safeProduct.curator?.name || "Unknown"}
                      </Paragraph1>
                      <span className="block font-medium text-green-600 text-xs">
                        Verified
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === "APPROVED" ||
                      product.status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : product.status === "RENTED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.status === "APPROVED" ||
                    product.status === "AVAILABLE"
                      ? "Available"
                      : product.status === "RENTED"
                        ? "Rented"
                        : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const price = listingPriceDisplay(safeProduct as typeof safeProduct & { listingType?: string; resalePrice?: number });
                    return (
                      <>
                        <Paragraph1 className="font-medium text-gray-900">
                          ₦{price.primary.amount.toLocaleString()}
                        </Paragraph1>
                        {price.secondary ? (
                          <Paragraph1 className="mt-1 text-gray-600 text-xs">
                            {price.secondary.label}: ₦
                            {price.secondary.amount.toLocaleString()}
                          </Paragraph1>
                        ) : null}
                      </>
                    );
                  })()}
                </td>
                <td className="flex gap-2 px-6 py-4">
                  {onReactivate ? (
                    <button
                      type="button"
                      onClick={() => onReactivate(product.id)}
                      disabled={reactivatingProductId === product.id}
                      className="flex justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 text-sm transition disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={18} />
                      {reactivatingProductId === product.id
                        ? "Reactivating..."
                        : "Reactivate"}
                    </button>
                  ) : null}
                  {onDeactivate && canDeactivateListing(product.status) ? (
                    <button
                      type="button"
                      onClick={() => onDeactivate(product.id)}
                      disabled={deactivatingProductId === product.id}
                      className="flex justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 text-sm transition disabled:cursor-not-allowed"
                    >
                      <Power size={18} />
                      {deactivatingProductId === product.id
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>
                  ) : null}
                  <button
                    onClick={() => onView(product)}
                    className="flex justify-center items-center gap-2 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 text-sm transition"
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

export default React.memo(ActiveListingsTable);
