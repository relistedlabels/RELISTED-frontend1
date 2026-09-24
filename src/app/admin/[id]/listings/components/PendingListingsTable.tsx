import React, { useState } from "react";
import { Check, X, Eye } from "lucide-react";
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
import { ApprovalConfirmationModal } from "./ApprovalConfirmationModal";
import ItemTypeBadge from "./ItemTypeBadge";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

interface PendingListingsTableProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onApprove: (productId: string) => void;
  onReject: (productId: string) => void;
  onView: (product: Product) => void;
  approvingProductId?: string | null;
}

function buildColumns(
  onApproveClick: (product: Product) => void,
  onReject: (productId: string) => void,
  onView: (product: Product) => void,
  approvingProductId?: string | null,
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
            <div className="mt-2">
              <ItemTypeBadge listingType={priceInfo.listingType} />
            </div>
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
      id: "price",
      header: "Price",
      mobile: "detail",
      render: (product) => {
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
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              ₦{safeProduct.originalValue?.toLocaleString() || 0}
            </Paragraph1>
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
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (product) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onApproveClick(product)}
            disabled={approvingProductId === product.id}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <Check size={18} />
            {approvingProductId === product.id ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => onReject(product.id)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <X size={18} />
            Reject
          </button>
          <button
            type="button"
            onClick={() => onView(product)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Eye size={18} />
            View
          </button>
        </div>
      ),
    },
  ];
}

export default function PendingListingsTable({
  products,
  isLoading,
  error,
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

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  const columns = buildColumns(
    handleApproveClick,
    onReject,
    onView,
    approvingProductId,
  );

  return (
    <div>
      <ResponsiveDataTable
        rows={products}
        columns={columns}
        getRowKey={(product) => product.id}
        loading={isLoading && products.length === 0}
        loadingState={
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading products...</p>
          </div>
        }
        emptyState={
          <div className="p-8 text-center">
            <p className="text-gray-500">No pending products found</p>
          </div>
        }
      />
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
