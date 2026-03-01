"use client";
import React from "react";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Header1, Header1Plus, Paragraph1 } from "@/common/ui/Text";
import CheckoutProductList from "./components/CheckoutProductList";
import { FinalOrderSummaryCard } from "./components/FinalOrderSummaryCard";
import { useEffect, useState } from "react";
import { useRentalRequests } from "@/lib/queries/renters/useRentalRequests";
import { productApi } from "@/lib/api/product";

export default function CartPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Your Cart", href: null },
  ];

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch pending rental requests for CheckoutProductList
  const { data, isLoading, error } = useRentalRequests("pending", page, limit);
  // Fetch approved rental requests for FinalOrderSummaryCard
  const {
    data: approvedData,
    isLoading: approvedIsLoading,
    error: approvedError,
  } = useRentalRequests("approved", 1, 100);
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

  // Fetch product details for approved items
  const [approvedItemsWithProduct, setApprovedItemsWithProduct] = useState<
    Array<any>
  >([]);

  useEffect(() => {
    async function fetchApprovedProductDetails() {
      if (!approvedData?.rentalRequests) return;
      const requests = approvedData.rentalRequests;
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
      setApprovedItemsWithProduct(results);
    }
    fetchApprovedProductDetails();
  }, [approvedData]);

  // Group approved items by listerID for checkout summary
  const groupedByLister = approvedItemsWithProduct.reduce(
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
      <Header1Plus className="uppercase mb-8">Your Cart</Header1Plus>

      <div className="grid xl:grid-cols-3 gap-4 sm:gap-16">
        <div className="col-span-2">
          <CheckoutProductList
            cartItems={cartItemsWithProduct}
            isLoading={isLoading}
            error={error}
          />
          
        </div>
        <div className="flex flex-col gap-4">
          <FinalOrderSummaryCard
            listerGroups={listerGroups}
            isLoading={approvedIsLoading}
            error={approvedError}
          />

          {/* Pagination Info */}
          {data && data.totalPages && data.totalPages > 1 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-3">
                Page {page} of {data.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage(Math.min(data.totalPages as number, page + 1))
                  }
                  disabled={page === (data.totalPages as number)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
