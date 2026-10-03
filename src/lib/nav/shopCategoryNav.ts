export type ShopCategoryNavItem = {
  name: string;
  subMenu: null;
  title: string;
  description: string;
  filter: { key: "category"; value: string };
};

/** Stable shop nav links from API categories (alphabetical). */
export function shopCategoryNavItems(
  categories: Array<{ id: string; name: string }>,
): ShopCategoryNavItem[] {
  return [...categories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => ({
      name: category.name,
      subMenu: null,
      title: category.name,
      description: `Shop ${category.name}`,
      filter: { key: "category", value: category.id },
    }));
}
