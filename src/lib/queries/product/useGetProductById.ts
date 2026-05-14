import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

export type ProductAttachmentUpload = {
  id: string;
  url: string;
  /** MIME type from upload row (e.g. image/jpeg, video/mp4). */
  type?: string;
  /** Gallery order from backend (0 = hero). Omitted on older API payloads. */
  displayOrder?: number;
};

export type ProductAttachmentDetail = {
  id: string;
  uploads: ProductAttachmentUpload[];
};

export type Product = {
  id: string;
  name: string;
  subText: string;
  description: string;
  condition: string;
  composition: string;
  material?: string;
  measurement: string;
  originalValue: number;
  resalePrice?: number | null;
  dailyPrice: number;
  quantity: number;
  color: string;
  warning: string;
  careInstruction: string;
  careSteps?: string;
  stylingTip: string;
  attachments: ProductAttachmentDetail | null;
  categoryId: string;
  tagIds?: string[];
  brandId: string | null;
  brand?: { id: string; name: string } | null;
  rating?: number;
  reviewCount?: number;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  status?: string;
  rejectionComment?: string | null;
  closetId?: string | null;
  closet?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;
};

/** Authenticated lister/owner view (includes closet, full fields). */
export type ListerProduct = Product;

export const fetchListerProductById = async (
  productId: string,
): Promise<ListerProduct> => {
  const res = await apiFetch<{
    success: boolean;
    data: ListerProduct;
  }>(`/product/${productId}`);
  return res.data;
};

export const useListerProductById = (productId: string) => {
  return useQuery({
    queryKey: ["product", "lister", productId],
    queryFn: () => fetchListerProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

type ProductByIdResponse = {
  success: boolean;
  message: string;
  data: Product;
};

// ✅ shared fetcher
export const fetchProductById = async (productId: string): Promise<Product> => {
  const res = await apiFetch<ProductByIdResponse>(
    `/api/public/products/${productId}`,
  );
  return res.data;
};

export const useGetProductById = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
