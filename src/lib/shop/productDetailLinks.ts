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
