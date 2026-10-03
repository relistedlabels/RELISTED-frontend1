"use client";

import Link from "next/link";
import type { UserProduct } from "@/lib/api/product";
import { shopTagHref } from "@/lib/shop/productDetailLinks";

interface ProductMetadataSectionProps {
  product: UserProduct;
}

export default function ProductMetadataSection({
  product,
}: ProductMetadataSectionProps) {
  const tags = product.tags ?? [];
  const hasTags = tags.length > 0;

  if (!hasTags) {
    return null;
  }

  return (
    <div className="mb-6 space-y-5 border-b border-gray-200 pb-6">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={shopTagHref(tag.name)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
