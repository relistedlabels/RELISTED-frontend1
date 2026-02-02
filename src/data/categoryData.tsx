// categoryData.ts
export interface Category {
  image: string;
  title: string;
  description: string;
  link: string;
  height: string;
}

export const categories: Category[] = [
  {
    image: "/category/c1.jpg",
    title: "Date Night",
    description:
      "Irresistible looks designed to turn heads, spark chemistry, and leave a lasting impression.",
    link: "/shop",
    height: "463px",
  },
  {
    image: "/category/c2.jpg",
    title: "Brunch Outfits",
    description:
      "Effortlessly chic styles made for slow mornings, good vibes, and Instagram-worthy moments.",
    link: "/shop",
    height: "477px",
  },
  {
    image: "/category/c3.jpg",
    title: "Special Occasions",
    description:
      "Elevated pieces crafted for moments that matter — when looking unforgettable is non-negotiable.",
    link: "/shop",
    height: "333px",
  },
  {
    image: "/category/c4.jpg",
    title: "Corporate Closet",
    description:
      "Power dressing redefined. Polished, confident silhouettes for the modern professional woman.",
    link: "/shop",
    height: "607px",
  },
  {
    image: "/category/c5.jpg",
    title: "Red Carpet",
    description:
      "Bold, dramatic, and statement-making designs inspired by celebrity moments and grand entrances.",
    link: "/shop",
    height: "414px",
  },
  {
    image: "/category/c6.jpg",
    title: "Vacation Mode",
    description:
      "Relaxed yet refined pieces perfect for getaways, beach days, and sun-soaked adventures.",
    link: "/shop",
    height: "526px",
  },
];
