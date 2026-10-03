// categoryData.ts
export interface Category {
  image: string;
  /** Display label in UI and shop page title. */
  title: string;
  /** Prod `Tag.name` used for filtering (may differ from title). */
  tag: string;
  description: string;
  link: string;
  height: string;
  filterType?: string;
  /** Same as `tag`; kept for occasion tile matching. */
  filterValue?: string;
}

function shopOccasionLink(title: string, tag: string, description: string): string {
  const params = new URLSearchParams();
  params.set("tags", tag);
  params.set("title", title);
  params.set("description", description);
  return `/shop?${params.toString()}`;
}

export const categories: Category[] = [
  {
    image: "/category/c1.jpg",
    title: "Night Out",
    tag: "Night out",
    description:
      "Irresistible looks designed to turn heads, spark chemistry, and leave a lasting impression.",
    link: shopOccasionLink(
      "Night Out",
      "Night out",
      "Irresistible looks designed to turn heads, spark chemistry, and leave a lasting impression.",
    ),
    height: "500px",
    filterType: "categories",
    filterValue: "Night out",
  },
  {
    image: "/category/c2.jpg",
    title: "Brunch Outfits",
    tag: "Brunch Outfits",
    description:
      "Effortlessly chic styles made for slow mornings, good vibes, and Instagram-worthy moments.",
    link: shopOccasionLink(
      "Brunch Outfits",
      "Brunch Outfits",
      "Effortlessly chic styles made for slow mornings, good vibes, and Instagram-worthy moments.",
    ),
    height: "500px",
    filterType: "categories",
    filterValue: "Brunch Outfits",
  },
  {
    image: "/category/c3.jpg",
    title: "Special Occasions",
    tag: "Special occasions",
    description:
      "Elevated pieces crafted for moments that matter, when looking unforgettable is non-negotiable.",
    link: shopOccasionLink(
      "Special Occasions",
      "Special occasions",
      "Elevated pieces crafted for moments that matter, when looking unforgettable is non-negotiable.",
    ),
    height: "500px",
    filterType: "categories",
    filterValue: "Special occasions",
  },
  {
    image: "/category/c4.jpg",
    title: "Corporate Closet",
    tag: "Corporate Closet",
    description:
      "Power dressing redefined. Polished, confident silhouettes for the modern professional woman.",
    link: shopOccasionLink(
      "Corporate Closet",
      "Corporate Closet",
      "Power dressing redefined. Polished, confident silhouettes for the modern professional woman.",
    ),
    height: "500px",
    filterType: "categories",
    filterValue: "Corporate Closet",
  },
  {
    image: "/category/c5.jpg",
    title: "Red Carpet",
    tag: "Formal wear",
    description:
      "Bold, dramatic, and statement-making designs inspired by celebrity moments and grand entrances.",
    link: shopOccasionLink(
      "Red Carpet",
      "Formal wear",
      "Bold, dramatic, and statement-making designs inspired by celebrity moments and grand entrances.",
    ),
    height: "414px",
    filterType: "categories",
    filterValue: "Formal wear",
  },
  {
    image: "/category/c6.jpg",
    title: "Vacation Mode",
    tag: "Vacation Outfits",
    description:
      "Relaxed yet refined pieces perfect for getaways, beach days, and sun-soaked adventures.",
    link: shopOccasionLink(
      "Vacation Mode",
      "Vacation Outfits",
      "Relaxed yet refined pieces perfect for getaways, beach days, and sun-soaked adventures.",
    ),
    height: "526px",
    filterType: "categories",
    filterValue: "Vacation Outfits",
  },
];
