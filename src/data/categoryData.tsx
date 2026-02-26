// categoryData.ts
export interface Category {
  image: string;
  title: string;
  description: string;
  link: string;
  height: string;
  filterType?: string;
  filterValue?: string;
}

export const categories: Category[] = [
  {
    image: "/category/c1.jpg",
    title: "Date Night",
    description:
      "Irresistible looks designed to turn heads, spark chemistry, and leave a lasting impression.",
    link: `/shop?category=${encodeURIComponent("Date Night")}&title=${encodeURIComponent("Date Night")}&description=${encodeURIComponent("Irresistible looks designed to turn heads, spark chemistry, and leave a lasting impression.")}`,
    height: "463px",
    filterType: "categories",
    filterValue: "Date Night",
  },
  {
    image: "/category/c2.jpg",
    title: "Brunch Outfits",
    description:
      "Effortlessly chic styles made for slow mornings, good vibes, and Instagram-worthy moments.",
    link: `/shop?category=${encodeURIComponent("Brunch Outfits")}&title=${encodeURIComponent("Brunch Outfits")}&description=${encodeURIComponent("Effortlessly chic styles made for slow mornings, good vibes, and Instagram-worthy moments.")}`,
    height: "477px",
    filterType: "categories",
    filterValue: "Brunch Outfits",
  },
  {
    image: "/category/c3.jpg",
    title: "Special Occasions",
    description:
      "Elevated pieces crafted for moments that matter — when looking unforgettable is non-negotiable.",
    link: `/shop?category=${encodeURIComponent("Special Occasions")}&title=${encodeURIComponent("Special Occasions")}&description=${encodeURIComponent("Elevated pieces crafted for moments that matter — when looking unforgettable is non-negotiable.")}`,
    height: "333px",
    filterType: "categories",
    filterValue: "Special Occasions",
  },
  {
    image: "/category/c4.jpg",
    title: "Corporate Closet",
    description:
      "Power dressing redefined. Polished, confident silhouettes for the modern professional woman.",
    link: `/shop?category=${encodeURIComponent("Corporate Closet")}&title=${encodeURIComponent("Corporate Closet")}&description=${encodeURIComponent("Power dressing redefined. Polished, confident silhouettes for the modern professional woman.")}`,
    height: "607px",
    filterType: "categories",
    filterValue: "Corporate Closet",
  },
  {
    image: "/category/c5.jpg",
    title: "Red Carpet",
    description:
      "Bold, dramatic, and statement-making designs inspired by celebrity moments and grand entrances.",
    link: `/shop?category=${encodeURIComponent("Red Carpet")}&title=${encodeURIComponent("Red Carpet")}&description=${encodeURIComponent("Bold, dramatic, and statement-making designs inspired by celebrity moments and grand entrances.")}`,
    height: "414px",
    filterType: "categories",
    filterValue: "Red Carpet",
  },
  {
    image: "/category/c6.jpg",
    title: "Vacation Mode",
    description:
      "Relaxed yet refined pieces perfect for getaways, beach days, and sun-soaked adventures.",
    link: `/shop?category=${encodeURIComponent("Vacation Mode")}&title=${encodeURIComponent("Vacation Mode")}&description=${encodeURIComponent("Relaxed yet refined pieces perfect for getaways, beach days, and sun-soaked adventures.")}`,
    height: "526px",
    filterType: "categories",
    filterValue: "Vacation Mode",
  },
];
