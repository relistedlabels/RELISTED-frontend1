// lib/stores/productDraftStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/queries/product/useGetProductById";

export type Tag = {
  id: string;
  value: string;
  isNew?: boolean;
};

export type Attachment = {
  id: string;
  url: string;
  name: string;
  progress: number;
  type?: string;
  slotId?: string;
};

export type ProductDraft = {
  name: string;
  subText: string;
  description: string;
  condition: string;
  composition: string;
  material: string;
  measurement: string;

  originalValue: number;
  dailyRentalPrice: number;
  collateralPrice: number;
  resalePrice: number;
  quantity: number;

  color: string;
  warning: string;
  size: string;

  careInstruction: string;
  careSteps: string;
  stylingTip: string;

  tagIds: string[];
  attachments: Attachment[];
  categoryId: string;
  brandId: string;
  saleType: "resale" | "rent" | "rent-resale";
};

type ProductDraftStore = {
  data: ProductDraft;
  setField: <K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) => void;
  mergeData: (partial: Partial<ProductDraft>) => void;
  populateFromProduct: (product: Product) => void;
  reset: () => void;
};

const initialState: ProductDraft = {
  name: "Untitled Item",
  subText: "Add a subtitle",
  description: "Describe your item",
  condition: "Like New",
  composition: "Cotton",
  material: "Cotton",
  measurement: "M",

  originalValue: 100,
  dailyRentalPrice: 10,
  collateralPrice: 80,
  resalePrice: 100,
  quantity: 1,

  color: "Black",
  warning: "Handle with care",
  size: "M",

  careInstruction: "Dry clean only",
  careSteps: "Professional care recommended",
  stylingTip: "Perfect for casual wear",

  tagIds: [],
  attachments: [],
  categoryId: "",
  brandId: "",
  saleType: "rent-resale",
};

export const useProductDraftStore = create<ProductDraftStore>()(
  persist(
    (set) => ({
      data: initialState,

      setField: (key, value) =>
        set((state) => ({
          data: { ...state.data, [key]: value },
        })),

      mergeData: (partial) =>
        set((state) => ({
          data: { ...state.data, ...partial },
        })),

      populateFromProduct: (product: Product) => {
        // Map uploads to slots
        const uploads = product.attachments?.uploads || [];
        const slotMap = ["main", "photo1", "photo2", "photo3", "video"];
        const productLike = product as Product & {
          tagids?: string[];
          tagId?: string | null;
          tags?: Array<{ id?: string; tagId?: string }>;
        };
        const tagIdsFromList = productLike.tags
          ?.map((t) => t.id || t.tagId)
          .filter((id): id is string => !!id);
        const normalizedTagIds = Array.from(
          new Set(
            (
              productLike.tagIds ??
              productLike.tagids ??
              (productLike.tagId ? [productLike.tagId] : undefined) ??
              tagIdsFromList ??
              []
            ).filter((id): id is string => !!id),
          ),
        );
        const mappedAttachments = uploads.map(
          (upload: { id: string; url: string }, idx: number) => ({
            id: upload.id,
            url: upload.url,
            name: `Image ${idx + 1}`,
            progress: 100,
            type: "image",
            slotId: slotMap[idx] || undefined,
          }),
        );
        set({
          data: {
            name: product.name,
            subText: product.subText,
            description: product.description,
            condition: product.condition,
            composition: product.composition || "Cotton", // ✅ Default to Cotton if empty
            material: product.material || "Cotton", // ✅ Default to Cotton if empty
            measurement: product.measurement,
            originalValue: product.originalValue,
            dailyRentalPrice: product.dailyPrice,
            collateralPrice: Math.round((product.originalValue || 0) * 0.8),
            resalePrice:
              (product as Product & { resalePrice?: number }).resalePrice ||
              product.originalValue ||
              100,
            quantity: product.quantity,
            color: product.color,
            warning: product.warning,
            size: product.measurement,
            careInstruction: product.careInstruction,
            careSteps: product.careSteps || "",
            stylingTip: product.stylingTip,
            tagIds: normalizedTagIds,
            attachments: mappedAttachments,
            categoryId: product.categoryId,
            brandId: product.brandId ?? "",
            saleType: (["resale", "rent", "rent-resale"].includes(
              (product as Product & { saleType?: string }).saleType || "",
            )
              ? (product as Product & { saleType?: string }).saleType
              : "rent-resale") as "resale" | "rent" | "rent-resale",
          },
        });
      },

      reset: () => set({ data: initialState }),
    }),
    { name: "product-draft-store" },
  ),
);
