"use client";
import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus } from "@/common/ui/Text";
import CheckoutProductList from "./components/CheckoutProductList";
import { FinalOrderSummaryCard } from "./components/FinalOrderSummaryCard";
import { useEffect, useState } from "react";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { useCartItems } from "@/lib/queries/renters/useCartItems";
import { productApi } from "@/lib/api/product";
import type { CartItem } from "@/lib/api/cart";
import {
  isCartRentalMainListRow,
  rentalMetaFromCartApiItem,
  resolveRentalMetaForCartLine,
} from "@/lib/cart/mergeCartLineRental";
import type { CartCheckoutLine } from "./types";
import { approvedRentalsMatchingCurrentCart } from "@/lib/cart/approvedRentalsMatchingCart";

export default function CartPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: null },
  ];

  const {
    data: cartData,
    isLoading: cartIsLoading,
    error: cartError,
  } = useCartItems();

  const {
    data: approvedData,
    isLoading: approvedIsLoading,
    error: approvedError,
  } = useRentalRequests("approved", 1, 100);

  const { data: pendingData } = useRentalRequests("pending", 1, 100);

  const [cartLines, setCartLines] = useState<CartCheckoutLine[]>([]);

  useEffect(() => {
    async function buildLinesFromCart() {
      const items = cartData?.items;
      if (!items?.length) {
        setCartLines([]);
        return;
      }

      const allRentals = [
        ...(pendingData?.rentalRequests ?? []),
        ...(approvedData?.rentalRequests ?? []),
      ];

      const lineGroups = await Promise.all(
        items.map(async (item: CartItem) => {
          const embedded = item.product;
          let productDetail: Record<string, unknown> | null = embedded
            ? { ...embedded }
            : null;
          try {
            const response = await productApi.getPublicById(item.productId);
            productDetail = {
              ...(embedded || {}),
              ...(response.data as object),
            } as Record<string, unknown>;
          } catch {
            /* keep embedded only */
          }
          const daily =
            Number(
              (productDetail as { dailyPrice?: number })?.dailyPrice ??
                embedded?.dailyPrice,
            ) || 0;
          const productName =
            (productDetail as { name?: string })?.name ?? embedded?.name;

          const days = item.days || 0;
          const fromApi = rentalMetaFromCartApiItem(
            item as CartItem & Record<string, unknown>,
          );
          const rentalMeta = resolveRentalMetaForCartLine(
            item.id,
            item.productId,
            fromApi,
            allRentals,
          );
          const merged =
            rentalMeta && fromApi
              ? { ...fromApi, ...rentalMeta }
              : (rentalMeta ?? fromApi);

          if (!merged) {
            return [
              {
                lineId: item.id,
                cartItemId: item.id,
                productId: item.productId,
                rentalDays: days,
                totalPrice: daily * days,
                deliveryFee: 0,
                productDetail,
                productName,
              } satisfies CartCheckoutLine,
            ];
          }

          if (!isCartRentalMainListRow(merged.status, merged.expiresAt)) {
            return [];
          }

          return [
            {
              lineId: item.id,
              cartItemId: item.id,
              productId: item.productId,
              rentalDays: days,
              totalPrice: daily * days,
              deliveryFee: 0,
              productDetail,
              productName,
              expiresAt: merged.expiresAt,
              status: merged.status,
              rentalRequestId: merged.rentalRequestId,
            } satisfies CartCheckoutLine,
          ];
        }),
      );
      setCartLines(lineGroups.flat());
    }
    buildLinesFromCart();
  }, [cartData, pendingData, approvedData]);

  // Fetch product details for approved items
  const [approvedItemsWithProduct, setApprovedItemsWithProduct] = useState<
    Array<any>
  >([]);

  useEffect(() => {
    async function fetchApprovedProductDetails() {
      if (!approvedData) {
        setApprovedItemsWithProduct([]);
        return;
      }
      const requests = approvedData.rentalRequests ?? [];
      const results = await Promise.all(
        requests.map(async (item) => {
          try {
            const response = await productApi.getPublicById(item.productId);
            return {
              ...item,
              cartItemId: item.cartItemId ?? (item as { cart_item_id?: string }).cart_item_id,
              productDetail: response.data,
            };
          } catch (err) {
            return {
              ...item,
              cartItemId: item.cartItemId ?? (item as { cart_item_id?: string }).cart_item_id,
              productDetail: null,
              productDetailError: err,
            };
          }
        }),
      );
      setApprovedItemsWithProduct(results);
    }
    fetchApprovedProductDetails();
  }, [approvedData]);

  const approvedMatchingCart = approvedRentalsMatchingCurrentCart(
    approvedItemsWithProduct,
    cartData?.items,
  );

  const groupedByLister = approvedMatchingCart.reduce(
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
      <Header1Plus className="uppercase mb-8">Your Cart</Header1Plus>

      <div className="grid xl:grid-cols-3 gap-4 sm:gap-16">
        <div className="col-span-2">
          <CheckoutProductList
            cartItems={cartLines}
            isLoading={cartIsLoading}
            error={cartError}
          />
        </div>
        <div className="flex flex-col gap-4">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={approvedIsLoading}
            error={approvedError}
          />
        </div>
      </div>
    </div>
  );
}
