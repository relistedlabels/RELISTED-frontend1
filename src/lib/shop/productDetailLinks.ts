export type ProductDetailMode = "rent" | "buy";

export function productDetailHref(
  id: string,
  mode?: ProductDetailMode,
): string {
  const base = `/shop/product-details/${id}`;
  return mode === "buy" ? `${base}?mode=buy` : base;
}

/** Default Rent/Buy tab on PDP from URL mode and listing availability. */
export function resolveProductDetailTab(
  mode: string | null,
  hasRent: boolean,
  hasResale: boolean,
): "rent" | "resale" {
  if (mode === "buy" && hasResale) return "resale";
  if (mode === "rent" && hasRent) return "rent";
  return hasRent ? "rent" : "resale";
}

export function shopCategoryHref(category: { id: string; name: string }): string {
  const params = new URLSearchParams();
  params.set("category", category.id);
  params.set("title", category.name);
  params.set("description", `Shop ${category.name}`);
  return `/shop?${params.toString()}`;
}

export function shopTagHref(tagName: string): string {
  const params = new URLSearchParams();
  params.set("tags", tagName);
  params.set("title", tagName);
  params.set("description", `Shop ${tagName}`);
  return `/shop?${params.toString()}`;
}
