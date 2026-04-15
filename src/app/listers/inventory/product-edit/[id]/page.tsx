"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { useGetProductById } from "@/lib/queries/product/useGetProductById";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import DashboardLayout from "@/app/listers/components/DashboardLayout";
import EditProductHeader from "@/app/listers/components/EditProductHeader";
import { ItemImageUploader } from "@/app/listers/components/ItemImageUploader";
import { BasicInformationForm } from "@/app/listers/components/BasicInformationForm";
import { TagSelector } from "@/app/listers/components/TagSelector";
import { ItemDescription } from "@/app/listers/components/ItemDescription";
import UploadItemHeader from "@/app/listers/components/UploadItemHeader";
import { SaleTypeSelector } from "@/app/listers/components/SaleTypeSelector";
import { AnimatedFormContent } from "@/app/listers/components/AnimatedFormContent";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isPending, isError } = useGetProductById(productId);

  const populateFromProduct = useProductDraftStore(
    (state) => state.populateFromProduct,
  );
  const reset = useProductDraftStore((state) => state.reset);

  useEffect(() => {
    reset(); // Clear old draft data
  }, [reset, productId]); // Reset when product ID changes

  useEffect(() => {
    if (product) {
      populateFromProduct(product);
    }
  }, [product, populateFromProduct]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center gap-4 h-96">
          <div className="text-center">
            <p className="mb-2 font-semibold text-red-500">
              Failed to load product
            </p>
            <p className="mb-4 text-gray-600 text-sm">
              The product may have been deleted or you don't have access to it.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-[#33332D] hover:bg-black px-4 py-2 rounded-lg text-white transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const path = [
    // { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Dashboard", href: "#" },
    { label: "Inventory", href: "/listers/inventory" },
    { label: "Edit Item", href: null },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <div>
        <UploadItemHeader />
      </div>
      {/* select sales type */}
      <div className="mb-4">
        <SaleTypeSelector />
      </div>
      <AnimatedFormContent>
        <div>
          <div>
            <ItemImageUploader />
          </div>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-4">
            <BasicInformationForm />
            <div className="space-y-4">
              <TagSelector />
              <ItemDescription />
            </div>
          </div>
        </div>
      </AnimatedFormContent>
    </DashboardLayout>
  );
}
