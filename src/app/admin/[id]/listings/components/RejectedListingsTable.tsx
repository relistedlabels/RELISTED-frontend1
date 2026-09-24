import { Eye, RotateCcw } from "lucide-react";
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

function buildColumns(options: {
  onView: (product: Product) => void;
  onReactivate?: (productId: string) => void;
  reactivatingProductId?: string | null;
  showSelection?: boolean;
  selectedIds: Set<string>;
  onSelectOne: (productId: string, checked: boolean) => void;
}): ResponsiveColumnDef<Product>[] {
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
      id: "rejectionReason",
      header: "Rejection Reason",
      mobile: "badge",
      render: (product) => (
        <Paragraph1 className="text-sm text-red-600">
          {(product as any).rejectionComment || "No reason provided"}
        </Paragraph1>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (product) => (
        <div className="flex flex-wrap gap-2">
          {options.onReactivate && (
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
          )}
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
        <p className="text-red-500">Failed to load rejected products</p>
      </div>
    );
  }

  const columns = buildColumns({
    onView,
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
          <p className="text-gray-500">Loading rejected products...</p>
        </div>
      }
      emptyState={
        <div className="p-8 text-center">
          <p className="text-gray-500">No rejected products found</p>
        </div>
      }
    />
  );
}
