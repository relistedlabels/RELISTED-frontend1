import { isResaleItem } from "@/lib/listers/listerOrderRow";
import {
  firstProductAttachmentImageUrl,
  type ProductAttachmentUploadLike,
} from "@/lib/product/sortProductAttachmentUploads";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import { formatRentalDuration } from "@/lib/rental/formatRentalDuration";

export type CheckoutDisplayLine = {
  rowKey: string;
  productName: string;
  productImageUrl: string;
  subtitle: string;
  totalPrice: number;
};

export function checkoutLineRowKey(item: Record<string, unknown>): string {
  const requestId = item.requestId;
  if (typeof requestId === "string" && requestId.trim()) return requestId;
  const cartItemId = item.cartItemId ?? item.id;
  if (typeof cartItemId === "string" && cartItemId.trim()) return cartItemId;
  const productId = item.productId;
  if (typeof productId === "string" && productId.trim()) return productId;
  return "line";
}

export function resolveCheckoutDisplayLine(
  item: Record<string, unknown>,
): CheckoutDisplayLine {
  const product =
    (item.productDetail as Record<string, unknown> | null | undefined) ?? {};
  const productName =
    (typeof product.name === "string" && product.name.trim()) ||
    (typeof item.productName === "string" && item.productName.trim()) ||
    "Item";

  const uploads = (
    product.attachments as
      | { uploads?: ProductAttachmentUploadLike[] }
      | undefined
  )?.uploads;

  const rawImage =
    firstProductAttachmentImageUrl(uploads) ||
    (typeof item.productImage === "string" ? item.productImage : "") ||
    "";

  const productImageUrl = rawImage
    ? cloudinaryOptimizedImageUrl(rawImage, { preset: "thumb" })
    : "";

  const resale = item.isResale === true || isResaleItem(item);
  const rentalDays =
    typeof item.days === "number"
      ? item.days
      : typeof item.rentalDays === "number"
        ? item.rentalDays
        : 0;
  const subtitle = resale
    ? "Purchase"
    : rentalDays > 0
      ? formatRentalDuration(rentalDays)
      : "Rental";

  const totalPrice =
    typeof item.totalPrice === "number"
      ? item.totalPrice
      : typeof item.rentalPrice === "number"
        ? item.rentalPrice
        : 0;

  return {
    rowKey: checkoutLineRowKey(item),
    productName,
    productImageUrl,
    subtitle,
    totalPrice,
  };
}
