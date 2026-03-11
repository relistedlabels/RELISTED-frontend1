"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutContactAndPayment from "./components/CheckoutContactAndPayment";
import FinalOrderSummaryCard from "./components/FinalOrderSummaryCard";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { useCreateOrder } from "@/lib/mutations/renters/useCreateOrder";
import { productApi } from "@/lib/api/product";

export default function CheckoutPage() {
  const router = useRouter();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const [hasCreatedOrder, setHasCreatedOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: "/shop/cart" },
    { label: "Checkout", href: null },
  ];

  const { data, isLoading, error } = useRentalRequests("approved", 1, 100);
  const [cartItemsWithProduct, setCartItemsWithProduct] = useState<Array<any>>(
    [],
  );

  useEffect(() => {
    async function fetchProductDetails() {
      if (!data?.rentalRequests) return;
      const requests = data.rentalRequests;
      const results = await Promise.all(
        requests.map(async (item) => {
          try {
            const response = await productApi.getPublicById(item.productId);
            return {
              ...item,
              productDetail: response.data,
            };
          } catch (err) {
            return {
              ...item,
              productDetail: null,
              productDetailError: err,
            };
          }
        }),
      );
      setCartItemsWithProduct(results);
    }
    fetchProductDetails();
  }, [data]);

  // Retry order creation function
  const retryCreateOrder = () => {
    setOrderError(null);
    createOrder(undefined, {
      onSuccess: () => {
        toast.success("Order created successfully!");
        setHasCreatedOrder(true);
        setOrderError(null);
      },
      onError: (err: any) => {
        const errorMessage =
          err?.message || "Failed to create order. Please try again.";
        setOrderError(errorMessage);
        toast.error(errorMessage);
      },
    });
  };

  // Create order on component mount
  useEffect(() => {
    if (hasCreatedOrder) return; // Only create once

    retryCreateOrder();
  }, [hasCreatedOrder]);

  // Group cart items by listerID
  const groupedByLister = cartItemsWithProduct.reduce(
    (acc: Map<string, any[]>, item: any) => {
      const listerId = item.listerId;
      if (!acc.has(listerId)) {
        acc.set(listerId, []);
      }
      acc.get(listerId)!.push(item);
      return acc;
    },
    new Map(),
  );

  // Convert map to array of grouped items
  const listerGroups = [...groupedByLister.entries()].map(
    ([listerId, items]) => ({
      listerId,
      items,
    }),
  );

  return (
    <div className="container mx-auto px-4 py-[70px] sm:py-[100px] sm:px-0">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <Header1Plus className="uppercase mb-8">CHECKOUT</Header1Plus>
      <div className="grid xl:grid-cols-3 gap-4 sm:gap-16">
        <div className="col-span-2">
          <CheckoutContactAndPayment />
        </div>
        <div className="flex flex-col gap-4">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={isLoading}
            error={error}
            orderCreationError={orderError}
            isCreatingOrder={isCreatingOrder}
            onRetryOrder={() => retryCreateOrder()}
          />
        </div>
      </div>
    </div>
  );
}
