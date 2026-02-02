// src/data/reviewsData.ts

export interface Review {
  id: number;
  name: string;
  role: string;
  text: string;
  img: string;
}

export const reviews: Review[] = [
  {
    id: 1,
    name: "Jennifer Kelly",
    role: "Fashion Creator",
    text: "You won't regret it. It would like to personally thank you for your outstanding product. Absolutely wonderful.",
    img: "/images/user2.png",
  },
  {
    id: 2,
    name: "Maria Lawson",
    role: "Content Creator",
    text: "Relisted has completely changed the way I see fashion. The quality is unmatched.",
    img: "/images/user2.png",
  },
  {
    id: 3,
    name: "Daniel Carter",
    role: "Model",
    text: "I love how everything feels tailored and premium. Highly recommended.",
    img: "/images/user2.png",
  },
  {
    id: 4,
    name: "Sandra Williams",
    role: "Influencer",
    text: "Every piece feels like art. I'm obsessed with this brand.",
    img: "/images/user2.png",
  },
];
