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
  tagId: string;
  brandId: string;
  rating?: number;
  reviewCount?: number;
};

type ProductByIdResponse = { success: boolean; message: string; data: Product };

export const useGetProductById = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await apiFetch<ProductByIdResponse>(`/product/${productId}`);
      return res.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
