import { Eye } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
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

export default function ApprovedListingsTable({
  products,
  isLoading,
  error,
  onView,
}: ApprovedListingsTableProps) {
  if (isLoading && products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading approved products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load approved products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No approved products found</p>
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
              Curator
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide w-32">
              Curator
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Item Value
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Price
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Availability
            </th>
            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr
              key={product.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">
                <AdminListingThumb
                  url={listingThumbnailUrl(product)}
                  alt={product.name}
                />
              </td>
              <td className="py-4 px-6">
                <Paragraph1 className="font-medium text-gray-900">
                  {product.name}
                </Paragraph1>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <AdminCuratorAvatar
                    url={curatorAvatarUrl(product)}
                    name={product.curator?.name}
                  />
                  <Paragraph1 className="text-sm text-gray-900">
                    {product.curator?.name || "Unknown"}
                  </Paragraph1>
                </div>
              </td>
              <td className="py-4 px-6">
                <Paragraph1 className="font-medium text-gray-900">
                  ₦{product.originalValue?.toLocaleString() || 0}
                </Paragraph1>
              </td>
              <td className="py-4 px-6">
                {(() => {
                  const price = listingPriceDisplay(product as Product & { listingType?: string; resalePrice?: number });
                  return (
                    <>
                      <Paragraph1 className="font-medium text-gray-900">
                        ₦{price.primary.amount.toLocaleString()}
                      </Paragraph1>
                      {price.secondary ? (
                        <Paragraph1 className="text-xs text-gray-600 mt-1">
                          {price.secondary.label}: ₦
                          {price.secondary.amount.toLocaleString()}
                        </Paragraph1>
                      ) : null}
                    </>
                  );
                })()}
              </td>
              <td className="py-4 px-6">
                {/* <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span> */}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
