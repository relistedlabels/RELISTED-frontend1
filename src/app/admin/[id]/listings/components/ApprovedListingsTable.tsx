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
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

interface ApprovedListingsTableProps {
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
      render: (product) => (
        <Paragraph1 className="font-medium text-gray-900">
          {product.name}
        </Paragraph1>
      ),
    },
    {
      id: "curator",
      header: "Curator",
      mobile: "detail",
      render: (product) => (
        <div className="flex items-center gap-2">
          <AdminCuratorAvatar
            url={curatorAvatarUrl(product)}
            name={product.curator?.name}
          />
          <Paragraph1 className="text-sm text-gray-900">
            {product.curator?.name || "Unknown"}
          </Paragraph1>
        </div>
      ),
    },
    {
      id: "itemValue",
      header: "Item Value",
      mobile: "detail",
      render: (product) => (
        <Paragraph1 className="font-medium text-gray-900">
          ₦{product.originalValue?.toLocaleString() || 0}
        </Paragraph1>
      ),
    },
    {
      id: "price",
      header: "Price",
      mobile: "detail",
      render: (product) => {
        const price = listingPriceDisplay(
          product as Product & { listingType?: string; resalePrice?: number },
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
      id: "availability",
      header: "Availability",
      mobile: "badge",
      render: () => null,
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

export default function ApprovedListingsTable({
  products,
  isLoading,
  error,
  onView,
}: ApprovedListingsTableProps) {
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load approved products</p>
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
          <p className="text-gray-500">Loading approved products...</p>
        </div>
      }
      emptyState={
        <div className="p-8 text-center">
          <p className="text-gray-500">No approved products found</p>
        </div>
      }
    />
  );
}
