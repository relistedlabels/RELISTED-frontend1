import type { UserProduct } from "@/lib/api/product";
import {
  BUY_LISTING_TYPES,
  RENT_LISTING_TYPES,
} from "@/lib/shop/shopBrowse";

export type SimilarShopContext = {
  isPurchase?: boolean;
  categoryId?: string | null;
  brandName?: string | null;
  color?: string | null;
  size?: string | null;
  primaryTag?: string | null;
};

export function buildSimilarShopHref(context: SimilarShopContext = {}): string {
  const params = new URLSearchParams();
  params.set(
    "listingType",
    context.isPurchase ? BUY_LISTING_TYPES : RENT_LISTING_TYPES,
  );

  const categoryId = context.categoryId?.trim();
  const brandName = context.brandName?.trim();
  const color = context.color?.trim();
  const size = context.size?.trim();
  const primaryTag = context.primaryTag?.trim();

  if (categoryId) {
    params.append("category", categoryId);
  }

  if (brandName) {
    params.append("brand", brandName);
  }

  if (color) {
    params.set("color", color);
  }

  if (size) {
    params.set("size", size);
  }

  if (primaryTag) {
    params.set("tags", primaryTag);
  }

  return `/shop?${params.toString()}`;
}

export function buildSimilarShopHrefFromProduct(
  product: Pick<
    UserProduct,
    "categoryId" | "brand" | "color" | "measurement" | "tags" | "listingType"
  >,
  options?: { isPurchase?: boolean },
): string {
  const isPurchase =
    options?.isPurchase ??
    product.listingType === "RESALE";

  return buildSimilarShopHref({
    isPurchase,
    categoryId: product.categoryId,
    brandName: product.brand?.name ?? null,
    color: product.color,
    size: product.measurement,
    primaryTag: product.tags?.[0]?.name ?? null,
  });
}
