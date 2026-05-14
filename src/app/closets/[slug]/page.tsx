"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { closetApi } from "@/lib/api/closet";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

export default function PublicClosetPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const metaQuery = useQuery({
    queryKey: ["public-closet", slug],
    queryFn: () => closetApi.getPublicBySlug(slug),
    enabled: !!slug,
    retry: 1,
  });

  const productsQuery = useQuery({
    queryKey: ["public-closet-products", slug],
    queryFn: () =>
      closetApi.getPublicProducts(slug, { page: 1, limit: 24, sort: "newest" }),
    enabled: !!slug && metaQuery.isSuccess,
    retry: 1,
  });

  if (!slug) {
    return (
      <div className="flex justify-center items-center px-4 min-h-[40vh]">
        <Paragraph1>Invalid closet link.</Paragraph1>
      </div>
    );
  }

  if (metaQuery.isLoading) {
    return (
      <div className="flex justify-center items-center px-4 min-h-[40vh]">
        <Paragraph1 className="text-gray-600">Loading closet…</Paragraph1>
      </div>
    );
  }

  if (metaQuery.isError || !metaQuery.data?.data) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 px-4 min-h-[40vh]">
        <Paragraph1 className="font-semibold text-gray-800">
          Closet not found
        </Paragraph1>
        <Link href="/shop" className="text-gray-700 text-sm underline">
          Browse shop
        </Link>
      </div>
    );
  }

  const meta = metaQuery.data.data;
  const products = productsQuery.data?.data?.products ?? [];
  const pagination = productsQuery.data?.data?.pagination;

  return (
    <section className="bg-white px-4 md:px-10 py-8 w-full">
      <div className="mx-auto max-w-6xl container">
        <div className="flex sm:flex-row flex-col sm:items-center gap-4 mb-8">
          {meta.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.imageUrl}
              alt=""
              className="border border-gray-200 rounded-full w-20 h-20 object-cover"
            />
          ) : (
            <div className="flex justify-center items-center bg-gray-200 rounded-full w-20 h-20 font-bold text-gray-600 text-xl">
              {meta.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <Header1Plus className="font-light text-2xl sm:text-3xl">
              {meta.name}
            </Header1Plus>
            {meta.description ? (
              <Paragraph1 className="mt-2 max-w-2xl text-gray-600">
                {meta.description}
              </Paragraph1>
            ) : null}
            <Paragraph2 className="mt-2 text-gray-500 text-sm">
              Curated by {meta.owner.name} · {meta.publicProductCount} items
            </Paragraph2>
          </div>
        </div>

        {productsQuery.isLoading ? (
          <ProductCardSkeleton count={12} />
        ) : products.length === 0 ? (
          <Paragraph1 className="py-12 text-gray-600 text-center">
            No listings in this closet yet.
          </Paragraph1>
        ) : (
          <>
            <div className="gap-2 sm:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={primaryProductHeroImage(product)}
                  brand={product.brand?.name || ""}
                  name={product.name}
                  price={`₦${product.originalValue.toLocaleString()}`}
                  dailyPrice={product.dailyPrice}
                  resalePrice={product.resalePrice}
                  listingType={product.listingType}
                  size={product.measurement}
                  closetOwner={meta.name}
                  closetImage={meta.imageUrl ?? undefined}
                  isSold={product.status === "SOLD"}
                  isRentedOut={product.status === "RENTED"}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Paragraph1 className="mt-8 text-gray-500 text-sm text-center">
                More pages: use the shop filters API or increase limit — pagination
                UI can be extended here.
              </Paragraph1>
            )}
          </>
        )}
      </div>
    </section>
  );
}
