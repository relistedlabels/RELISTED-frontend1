import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  ListingCategory,
  ListingTag,
  ListingBrand,
} from "../../api/admin/listings";

interface ListParams {
  status?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// --- Listings Statistics ---

export const useListingsStatistics = () =>
  useQuery({
    queryKey: ["admin", "listings", "statistics"],
    queryFn: () => productsApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useListingCategories = () =>
  useQuery({
    queryKey: ["admin", "listings", "categories"],
    queryFn: () => productsApi.getAllCategories(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

// Note: getListings removed - use usePendingProducts(), useApprovedProducts(), or useRejectedProducts() instead
// These replace the old generic listing query with status-specific endpoints matching the new API

export const usePendingProducts = (
  params: { page?: number; count?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "products", "pending", params],
    queryFn: () => productsApi.getPending(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });

export const useActiveProducts = (
  params: { page?: number; count?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "products", "active", params],
    queryFn: () => productsApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });

// Approved products use the same endpoint as active for now
export const useApprovedProducts = (params: {
  page?: number;
  count?: number;
}) =>
  useQuery({
    queryKey: ["admin", "products", "approved", params],
    queryFn: () => productsApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useRejectedProducts = (
  params: {
    page?: number;
    count?: number;
  },
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "products", "rejected", params],
    queryFn: () => productsApi.getRejected(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });

export const useListingDetail = (productId: string) =>
  useQuery({
    queryKey: ["admin", "listings", "detail", productId],
    queryFn: () => productsApi.getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useProductAvailability = (
  productId: string,
  month: number,
  year: number,
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "listings", "availability", productId, month, year],
    queryFn: () => productsApi.getProductAvailability(productId, month, year),
    enabled: !!productId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useProductActivity = (productId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "listings", "activity", productId],
    queryFn: () => productsApi.getProductActivity(productId),
    enabled: !!productId && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

// --- Listings Mutations ---

export const useApproveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => productsApi.approveProduct(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "detail"],
      });
    },
    onError: (error) => {
      console.error("Failed to approve listing:", error);
    },
  });
};

export const useRejectListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      rejectionComment,
    }: {
      productId: string;
      rejectionComment: string;
    }) => productsApi.rejectProduct(productId, rejectionComment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "detail"],
      });
    },
    onError: (error) => {
      console.error("Failed to reject listing:", error);
    },
  });
};

export const useSetAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      isAvailable,
    }: {
      productId: string;
      isAvailable: boolean;
    }) => productsApi.setAvailability(productId, isAvailable),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "detail"],
      });
    },
    onError: (error) => {
      console.error("Failed to set availability:", error);
    },
  });
};

// --- Category Management ---

export const useAllCategories = () =>
  useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: () => productsApi.getAllCategories(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useEditCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      name,
      imageFile,
    }: {
      categoryId: string;
      name: string;
      imageFile?: File;
    }) => productsApi.editCategory(categoryId, name, imageFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "categories"],
      });
    },
    onError: (error) => {
      console.error("Failed to edit category:", error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => productsApi.deleteCategory(categoryId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "categories"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
    },
  });
};
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, imageFile }: { name: string; imageFile: File }) =>
      productsApi.createCategory(name, imageFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "all"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
  });
};

// --- Tag Management ---

export const useAllTags = () =>
  useQuery({
    queryKey: ["admin", "tags", "all"],
    queryFn: () => productsApi.getAllTags(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useEditTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, name }: { tagId: string; name: string }) =>
      productsApi.editTag(tagId, name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags", "all"] });
    },
    onError: (error) => {
      console.error("Failed to edit tag:", error);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => productsApi.deleteTag(tagId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to delete tag:", error);
    },
  });
};
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => productsApi.createTag(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to create tag:", error);
    },
  });
};

// --- Brand Management ---

export const useAllBrands = () =>
  useQuery({
    queryKey: ["admin", "brands", "all"],
    queryFn: () => productsApi.getAllBrands(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useEditBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId, name }: { brandId: string; name: string }) =>
      productsApi.editBrand(brandId, name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
    },
    onError: (error) => {
      console.error("Failed to edit brand:", error);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandId: string) => productsApi.deleteBrand(brandId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to delete brand:", error);
    },
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => productsApi.createBrand(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to create brand:", error);
    },
  });
};
