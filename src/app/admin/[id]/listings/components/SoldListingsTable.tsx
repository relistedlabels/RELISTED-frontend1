import React from "react";
import { Eye } from "lucide-react";
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

interface SoldListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onView: (product: Product) => void;
}

function buildColumns(
  onView: (product: Product) => void,
): ResponsiveColumnDef<Product>[] {
  return [
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
          {typeof (product as any).category === "object" &&
          (product as any).category
            ? ((product as any).category as any)?.name || "N/A"
            : ((product as any).category as string) || "N/A"}
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
      id: "status",
      header: "Status",
      mobile: "badge",
      render: () => (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          Sold
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      mobile: "detail",
      render: (product) => (
        <Paragraph1 className="font-medium text-gray-900">
          ₦{product.originalValue?.toLocaleString() || 0}
        </Paragraph1>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (product) => (
        <button
          type="button"
          onClick={() => onView(product)}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Eye size={18} />
          View
        </button>
      ),
    },
  ];
}

function SoldListingsTable({
  products,
  isLoading,
  error,
  onView,
}: SoldListingsTableProps) {
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load sold products</p>
      </div>
    );
  }

  const columns = buildColumns(onView);

  return (
    <ResponsiveDataTable
      rows={products}
      columns={columns}
      getRowKey={(product) => product.id}
      loading={isLoading && products.length === 0}
      loadingState={
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading sold products...</p>
        </div>
      }
      emptyState={
        <div className="p-8 text-center">
          <p className="text-gray-500">No sold products found</p>
        </div>
      }
    />
  );
}

export default React.memo(SoldListingsTable);
