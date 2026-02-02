"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../../../components/DashboardLayout";
import ProductMediaGallery from "@/app/listers/components/ProductMediaGallery";
import InventoryItemDetailsHeader from "@/app/listers/components/InventoryItemDetailsHeader";
import ProductInfoTabs from "@/app/listers/components/ProductInfoTabs";
import RentalsHistory from "@/app/listers/components/RentalsHistory";
import ManageItemHeader from "@/app/listers/components/ManageItemHeader";
import { useGetProductById } from "@/lib/queries/product/useGetProductById";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";

export default function Page() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isPending, isError } = useGetProductById(productId);
  const setProduct = useProductDetailsStore((state) => state.setProduct);

  useEffect(() => {
    if (product) {
      setProduct(product);
    }
  }, [product, setProduct]);

  const path = [
    // { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Dashboard", href: "#" },
    { label: "Inventory", href: "/listers/inventory" },
    { label: "Product", href: null },
  ];

  if (isPending) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Loading product...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Failed to load product</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 ">
        <Breadcrumbs items={path} />
      </div>
      <div>
        <ManageItemHeader />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <ProductMediaGallery />
        </div>
        <div>
          <InventoryItemDetailsHeader />
          <ProductInfoTabs />
        </div>
      </div>
      {/* <div className="mt-6">
        <RentalsHistory />
      </div> */}
    </DashboardLayout>
  );
}
