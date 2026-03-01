import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listingsApi,
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
    queryFn: () => listingsApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

// --- Listings Listing ---

export const useListingCategories = () =>
  useQuery({
    queryKey: ["admin", "listings", "categories"],
    queryFn: () => listingsApi.getCategories(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useListings = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "listings", "list", params],
    queryFn: () => listingsApi.getListings(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useListingDetail = (productId: string) =>
  useQuery({
    queryKey: ["admin", "listings", "detail", productId],
    queryFn: () => listingsApi.getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useExportListings = () =>
  useMutation({
    mutationFn: (params: ListParams) => listingsApi.exportListings(params),
  });

// --- Listings Mutations ---

export const useApproveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => listingsApi.approveProduct(productId),
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
    }) => listingsApi.rejectProduct(productId, rejectionComment),
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

// --- Category Management ---

export const useAllCategories = () =>
  useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: () => listingsApi.getAllCategories(),
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
    }) => listingsApi.editCategory(categoryId, name, imageFile),
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
    mutationFn: (categoryId: string) => listingsApi.deleteCategory(categoryId),
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

// --- Tag Management ---

export const useAllTags = () =>
  useQuery({
    queryKey: ["admin", "tags", "all"],
    queryFn: () => listingsApi.getAllTags(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useEditTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, name }: { tagId: string; name: string }) =>
      listingsApi.editTag(tagId, name),
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
    mutationFn: (tagId: string) => listingsApi.deleteTag(tagId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to delete tag:", error);
    },
  });
};

// --- Brand Management ---

export const useAllBrands = () =>
  useQuery({
    queryKey: ["admin", "brands", "all"],
    queryFn: () => listingsApi.getAllBrands(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useEditBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId, name }: { brandId: string; name: string }) =>
      listingsApi.editBrand(brandId, name),
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
    mutationFn: (brandId: string) => listingsApi.deleteBrand(brandId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands", "all"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (error) => {
      console.error("Failed to delete brand:", error);
    },
  });
};
