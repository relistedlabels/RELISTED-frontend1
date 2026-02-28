"use client";
import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutProductList from "./components/CheckoutProductList";
import { FinalOrderSummaryCard } from "./components/FinalOrderSummaryCard";
import { useEffect, useState } from "react";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { productApi } from "@/lib/api/product";
import RenterOrdersList from "./components/RenterOrdersList";

export default function CartPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: null },
  ];

  const { data, isLoading, error } = useRentalRequests("pending");
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

  return (
    <div className="container mx-auto px-4 py-[70px] sm:py-[100px] sm:px-0">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <Header1Plus className="uppercase mb-8">Your Cart</Header1Plus>
      <div className="grid xl:grid-cols-3 gap-4 sm:gap-16">
        <div className="col-span-2">
          <CheckoutProductList
            cartItems={cartItemsWithProduct}
            isLoading={isLoading}
            error={error}
          />
          <div className="mt-8">
            <RenterOrdersList />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <FinalOrderSummaryCard
            cartItems={cartItemsWithProduct}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
