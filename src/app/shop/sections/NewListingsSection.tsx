// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Filters from "../components/Filters";
import { useProductsQuery } from "@/lib/queries/product/useProductsQuery";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

export default function NewListingsSection() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: filteredProducts = [],
    isLoading: loading,
    error,
    refetch,
  } = useProductsQuery();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <section className="w-full px-4 md:px-10 bg-white py-4 sm:py-10">
        <div className="container mx-auto">
          <div className="text-center mb-2 sm:mb-6">
            <Header1Plus className="sm:text-center font-light flex-1">
              Available Listings
            </Header1Plus>
            <Paragraph1 className="text-gray-600 mt-4">
              Loading products...
            </Paragraph1>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full px-4 md:px-10 bg-white py-4 sm:py-10">
        <div className="container mx-auto">
          <div className="text-center mb-2 sm:mb-6">
            <Header1Plus className="sm:text-center font-light flex-1">
              Available Listings
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={9} />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 md:px-10 bg-white py-4 sm:py-10">
      <div className=" container mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-2 sm:mb-6">
          {/* Left Controls */}
          <div className=" hidden sm:flex items-center gap-4">
            <Filters />
          </div>

          <div className="flex sm:hidden  items-center gap-4">
            <Filters />
          </div>

          {/* Search */}
          <div className="w-full md:w-[200px] hidden sm:flex">
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border w-full px-4 py-2  text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Paragraph1 className="text-gray-600">
              No products found matching your criteria.
            </Paragraph1>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                image={
                  product.attachments?.uploads?.[0]?.url || "/placeholder.jpg"
                }
                brand={product.brandId || "BRAND"}
                name={product.name}
                price={`₦${product.originalValue.toLocaleString()}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
