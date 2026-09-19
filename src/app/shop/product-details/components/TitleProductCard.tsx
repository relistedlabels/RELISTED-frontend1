"use client";

import Link from "next/link";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import React from "react";
import SizeGuide from "./SizeGuide";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { useBrandById } from "@/lib/queries/brand/useBrands";
import { ProductDetailSkeleton } from "@/common/ui/SkeletonLoaders";
import { shopCategoryHref } from "@/lib/shop/productDetailLinks";

interface TitleProductCardProps {
  productId: string;
}

function CategoryPill({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-gray-900 bg-gray-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-gray-800"
    >
      {children}
    </Link>
  );
}

function AttributePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

function subTextMentionsColor(color: string, subText: string): boolean {
  const escaped = color.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(subText);
}

function subTextMentionsSize(measurement: string, subText: string): boolean {
  const escaped = measurement.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    new RegExp(`\\bsize\\s+${escaped}\\b`, "i").test(subText) ||
    new RegExp(`\\b${escaped}\\b`, "i").test(subText)
  );
}

const TitleProductCard: React.FC<TitleProductCardProps> = ({ productId }) => {
  const { data: product, isLoading, error } = usePublicProductById(productId);
  const { data: brand } = useBrandById(product?.brandId || "");

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="font-sans">
        <Paragraph1 className="mb-1 text-gray-700 tracking-wider">
          Product not found
        </Paragraph1>
      </div>
    );
  }

  const brandName = brand?.name || product.brand?.name || "Brand";
  const subText = product.subText?.trim() ?? "";
  const showColor =
    product.color &&
    (!subText || !subTextMentionsColor(product.color, subText));
  const showSize =
    product.measurement &&
    (!subText || !subTextMentionsSize(product.measurement, subText));

  const hasMetaRow =
    product.category?.name ||
    showColor ||
    showSize ||
    product.condition ||
    product.measurement;

  return (
    <div className="font-sans">
      <Paragraph1 className="mb-1 text-gray-700 tracking-wider">
        {brandName}
      </Paragraph1>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Header1Plus className="font-extrabold text-black text-2xl sm:text-3xl md:text-4xl leading-tight">
          {product.name}
        </Header1Plus>
        {product.status === "SOLD" ? (
          <span className="inline-flex items-center rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            Sold out
          </span>
        ) : product.status === "RENTED" ? (
          <span className="inline-flex items-center rounded-full bg-amber-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            Rented out
          </span>
        ) : null}
      </div>

      {subText ? (
        <Paragraph1 className="mb-3 text-base text-gray-500 sm:text-lg">
          {subText}
        </Paragraph1>
      ) : null}

      {hasMetaRow ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.category?.name ? (
              <CategoryPill href={shopCategoryHref(product.category)}>
                {product.category.name}
              </CategoryPill>
            ) : null}
            {showColor ? (
              <AttributePill>{product.color}</AttributePill>
            ) : null}
            {showSize ? (
              <AttributePill>Size {product.measurement}</AttributePill>
            ) : null}
            {product.condition ? (
              <AttributePill>{product.condition}</AttributePill>
            ) : null}
          </div>
          {product.measurement ? (
            <div className="flex justify-end sm:block">
              <SizeGuide variant="inline" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default TitleProductCard;
