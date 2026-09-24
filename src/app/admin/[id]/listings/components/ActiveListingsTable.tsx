import React from "react";
import { Eye, Power, RotateCcw } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
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

function buildColumns(
  options: {
    onView: (product: Product) => void;
    onDeactivate?: (productId: string) => void;
    deactivatingProductId?: string | null;
    onReactivate?: (productId: string) => void;
    reactivatingProductId?: string | null;
    showSelection?: boolean;
    selectedIds: Set<string>;
    onSelectOne: (productId: string, checked: boolean) => void;
  },
): ResponsiveColumnDef<Product>[] {
  const columns: ResponsiveColumnDef<Product>[] = [];

  if (options.showSelection) {
    columns.push({
      id: "selection",
      header: "",
      mobile: "hidden",
      render: (product) => (
        <input
          type="checkbox"
          checked={options.selectedIds.has(product.id)}
          onChange={(e) => options.onSelectOne(product.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
        />
      ),
    });
  }

  columns.push(
    {
      id: "image",
      header: "Image",
      mobile: "thumbnail",
      render: (product) => (
        <AdminListingThumb
          url={listingThumbnailUrl(product)}
          alt={product.name}
        />
      ),
    },
    {
      id: "itemName",
      header: "Item Name",
      mobile: "primary",
      render: (product) => {
        const safeProduct = {
          ...product,
          listingType: (product as any).listingType || "RENTAL",
          curator: product.curator
            ? { ...product.curator, isVerified: true }
            : undefined,
        };
        return (
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {safeProduct.name}
            </Paragraph1>
            {(safeProduct as any).brand && (
              <Paragraph1 className="mt-1 text-xs text-gray-500">
                {typeof (safeProduct as any).brand === "object"
                  ? (safeProduct as any).brand.name
                  : (safeProduct as any).brand}
              </Paragraph1>
            )}
            {(safeProduct as any).listingType && (
              <div className="mt-2">
                <ItemTypeBadge listingType={(safeProduct as any).listingType} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Category",
      mobile: "detail",
      render: (product) => (
        <Paragraph1 className="text-sm text-gray-900">
          {typeof product.category === "object" && product.category
            ? (product.category as any)?.name || "N/A"
            : (product.category as string) || "N/A"}
        </Paragraph1>
      ),
    },
    {
      id: "curator",
      header: "Curator",
      mobile: "detail",
      render: (product) => {
        const safeProduct = {
          ...product,
          curator: product.curator
            ? { ...product.curator, isVerified: true }
            : undefined,
        };
        return (
          <div className="flex items-center gap-2">
            <AdminCuratorAvatar
              url={curatorAvatarUrl(safeProduct)}
              name={safeProduct.curator?.name}
            />
            <div>
              <Paragraph1 className="text-sm text-gray-900">
                {safeProduct.curator?.name || "Unknown"}
              </Paragraph1>
              <span className="block text-xs font-medium text-green-600">
                Verified
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "availability",
      header: "Availability",
      mobile: "badge",
      render: (product) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.status === "APPROVED" || product.status === "AVAILABLE"
              ? "bg-green-100 text-green-700"
              : product.status === "RENTED"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {product.status === "APPROVED" || product.status === "AVAILABLE"
            ? "Available"
            : product.status === "RENTED"
              ? "Rented"
              : "Inactive"}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      mobile: "detail",
      render: (product) => {
        const safeProduct = {
          ...product,
          listingType: (product as any).listingType || "RENTAL",
        };
        const price = listingPriceDisplay(
          safeProduct as typeof safeProduct & {
            listingType?: string;
            resalePrice?: number;
          },
        );
        return (
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              ₦{price.primary.amount.toLocaleString()}
            </Paragraph1>
            {price.secondary ? (
              <Paragraph1 className="mt-1 text-xs text-gray-600">
                {price.secondary.label}: ₦
                {price.secondary.amount.toLocaleString()}
              </Paragraph1>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (product) => (
        <div className="flex flex-wrap gap-2">
          {options.onReactivate ? (
            <button
              type="button"
              onClick={() => options.onReactivate!(product.id)}
              disabled={options.reactivatingProductId === product.id}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={18} />
              {options.reactivatingProductId === product.id
                ? "Reactivating..."
                : "Reactivate"}
            </button>
          ) : null}
          {options.onDeactivate && canDeactivateListing(product.status) ? (
            <button
              type="button"
              onClick={() => options.onDeactivate!(product.id)}
              disabled={options.deactivatingProductId === product.id}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power size={18} />
              {options.deactivatingProductId === product.id
                ? "Deactivating..."
                : "Deactivate"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => options.onView(product)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Eye size={18} />
            View
          </button>
        </div>
      ),
    },
  );

  return columns;
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
  const handleSelectOne = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    onSelectionChange?.(newSelected);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load active products</p>
      </div>
    );
  }

  const columns = buildColumns({
    onView,
    onDeactivate,
    deactivatingProductId,
    onReactivate,
    reactivatingProductId,
    showSelection,
    selectedIds,
    onSelectOne: handleSelectOne,
  });

  return (
    <ResponsiveDataTable
      rows={products}
      columns={columns}
      getRowKey={(product) => product.id}
      loading={isLoading && products.length === 0}
      loadingState={
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading active products...</p>
        </div>
      }
      emptyState={
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      }
    />
  );
}

export default React.memo(ActiveListingsTable);
