import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

export type ProductAttachmentDetail = {
  id: string;
  uploads: { id: string; url: string }[];
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
