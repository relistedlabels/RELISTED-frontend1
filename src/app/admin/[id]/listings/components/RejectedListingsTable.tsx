import { Eye, RotateCcw } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { Product } from "@/lib/api/admin/listings";
import {
  AdminCuratorAvatar,
  AdminListingThumb,
  curatorAvatarUrl,
  listingThumbnailUrl,
} from "@/app/admin/lib/adminListingDisplay";
import ItemTypeBadge from "./ItemTypeBadge";

interface RejectedListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onView: (product: Product) => void;
  onReactivate?: (productId: string) => void;
  reactivatingProductId?: string | null;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  showSelection?: boolean;
}

export default function RejectedListingsTable({
  products,
  isLoading,
  error,
  onView,
  onReactivate,
  reactivatingProductId,
  selectedIds = new Set(),
  onSelectionChange,
  showSelection = false,
}: RejectedListingsTableProps) {
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

  if (products.length === 0) {
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
            {showSelection && (
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide w-12">
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
              REJECTION REASON
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                {showSelection && (
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(safeProduct.id)}
                      onChange={(e) => handleSelectOne(safeProduct.id, e.target.checked)}
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </td>
                )}
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
                  <Paragraph1 className="font-medium text-gray-900">
                    ₦{safeProduct.originalValue?.toLocaleString() || 0}
                  </Paragraph1>
                </td>
                <td className="py-4 px-6">
                  <Paragraph1 className="text-sm text-red-600">
                    {(safeProduct as any).rejectionComment ||
                      "No reason provided"}
                  </Paragraph1>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {onReactivate && (
                      <button
                        onClick={() => onReactivate(product.id)}
                        disabled={reactivatingProductId === product.id}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw size={18} />
                        {reactivatingProductId === product.id
                          ? "Reactivating..."
                          : "Reactivate"}
                      </button>
                    )}
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
    </div>
  );
}
