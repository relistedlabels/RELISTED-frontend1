"use client";
import React, { useEffect, useMemo, useState } from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutContactAndPayment from "./components/CheckoutContactAndPayment";
import FinalOrderSummaryCard from "./components/FinalOrderSummaryCard";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { productApi } from "@/lib/api/product";
import { getOrderSummaryApi } from "@/lib/api/cart";
import { approvedRentalsMatchingCurrentCart } from "@/lib/cart/approvedRentalsMatchingCart";

export default function CheckoutPage() {
  const [shippingTiers, setShippingTiers] = useState<
    Array<{
      name: string;
      totalShippingCost: number;
      grandTotal: number;
    }>
  >([]);
  const [selectedShippingTier, setSelectedShippingTier] = useState<string>("");

  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: "/shop/cart" },
    { label: "Checkout", href: null },
  ];

  const { data, isLoading, error } = useRentalRequests("approved", 1, 100);
  const { data: cartData, isLoading: cartIsLoading } = useCartItems();
  const [cartItemsWithProduct, setCartItemsWithProduct] = useState<Array<any>>(
    [],
  );

  // Fetch shipping tiers on mount
  useEffect(() => {
    const fetchShippingTiers = async () => {
      try {
        const response = await getOrderSummaryApi();
        if (response.data?.shippingTiers) {
          setShippingTiers(response.data.shippingTiers);
        }
      } catch (err) {
        console.error("Failed to fetch shipping tiers:", err);
      }
    };
    fetchShippingTiers();
  }, []);

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

  const approvedOnCheckout = useMemo(
    () =>
      approvedRentalsMatchingCurrentCart(
        cartItemsWithProduct,
        cartData?.items,
      ),
    [cartItemsWithProduct, cartData?.items],
  );

  const groupedByLister = useMemo(() => {
    return approvedOnCheckout.reduce(
      (acc: Map<string, any[]>, item: any) => {
        const listerId =
          (item.listerId as string | undefined)?.trim() || "unknown-lister";
        if (!acc.has(listerId)) {
          acc.set(listerId, []);
        }
        acc.get(listerId)!.push(item);
        return acc;
      },
      new Map(),
    );
  }, [approvedOnCheckout]);

  const listerGroups = useMemo(
    () =>
      [...groupedByLister.entries()].map(([listerId, items]) => ({
        listerId,
        items,
      })),
    [groupedByLister],
  );

  return (
    <div className="container mx-auto px-4 py-[70px] sm:py-[100px] sm:px-0">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <Header1Plus className="uppercase mb-8">CHECKOUT</Header1Plus>
      <div className="grid xl:grid-cols-3 gap-4 sm:gap-16">
        <div className="col-span-2">
          <CheckoutContactAndPayment
            onShippingTierSelected={setSelectedShippingTier}
            shippingTiers={shippingTiers}
          />
        </div>
        <div className="flex flex-col gap-4">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={isLoading || cartIsLoading}
            error={error}
            selectedShippingTier={selectedShippingTier}
            selectedTierData={shippingTiers.find(
              (tier) => tier.name === selectedShippingTier,
            )}
          />
        </div>
      </div>
    </div>
  );
}
