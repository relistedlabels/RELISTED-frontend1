# Public API Endpoints - PublicAPIs

**Status:** Awaiting Backend Implementation
**Last Updated:** 2026-02-08

## Overview

This document outlines all **PUBLIC** API endpoints that can be accessed without authentication on the RELISTED platform. These endpoints power the public-facing sections:

- **Home Page** (Landing page with featured collections, popular categories, top listers, and reviews)
- **Shop Page** (Product browsing, filtering, and search)
- **Listers Marketplace** (Browse all active listers/curators)
- **Product Details** (View individual item listings)
- **Lister Profiles** (View lister shop information)

These endpoints require **no authentication** and are designed for SEO, public discovery, and guest browsing.

---

## Browse Products

### 1. GET /api/public/products

**Location:**

- `src/app/home/sections/TopListingSection.tsx` (Top Listings carousel)
- `src/app/shop/sections/NewListingsSection.tsx` (Available Listings grid)
- `src/app/shop/components/Filters.tsx` (Shopping with filters)

**UX Explanation:**
Retrieve all available products/listings from all litters. This endpoint powers:

- **Top Listings Section** on home page - showing 7+ trending items
- **Shop Page** - full catalog browse with filtering and search
- **Product Grid** - displays items with images, prices, lister names, ratings

The endpoint supports:

- Pagination (for infinite scroll or load more)
- Filtering (by category, brand, price range, condition)
- Sorting (newest, price low/high, most popular, best rating)
- Search (by product name, brand, lister name)

**Request Format:**

```json
GET /api/public/products?page=1&limit=20&sort=newest&category=Dresses&brand=Gucci&minPrice=5000&maxPrice=50000&search=vintage
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20 (max 100)
- `sort` (optional): "newest" | "oldest" | "price_low" | "price_high" | "popular" | "rating" - default "newest"
- `category` (optional): Filter by category name (e.g., "Dresses", "Shoes")
- `brand` (optional): Filter by brand name (e.g., "Gucci", "Louis Vuitton")
- `minPrice` (optional): Minimum daily rental price
- `maxPrice` (optional): Maximum daily rental price
- `condition` (optional): "Excellent" | "Good" | "Fair"
- `gender` (optional): "Woman" | "Man" | "Unisex"
- `search` (optional): Search keyword

**Response Format:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Vintage Gucci Handbag",
        "brand": {
          "id": "brand_001",
          "name": "Gucci"
        },
        "category": {
          "id": "cat_001",
          "name": "Bags"
        },
        "condition": "Excellent",
        "dailyPrice": 8500,
        "currency": "NGN",
        "image": "https://cloudinary.com/product-001.jpg",
        "images": [
          "https://cloudinary.com/product-001.jpg",
          "https://cloudinary.com/product-001-2.jpg"
        ],
        "rating": 4.8,
        "reviews": 23,
        "lister": {
          "id": "user_456",
          "name": "Vintage Chic",
          "avatar": "https://cloudinary.com/lister-456.jpg",
          "rating": 4.9
        },
        "isInStock": true,
        "availableCount": 1
      },
      {
        "id": "prod_002",
        "name": "Givenchy Designer Shoes",
        "brand": {
          "id": "brand_002",
          "name": "Givenchy"
        },
        "category": {
          "id": "cat_002",
          "name": "Shoes"
        },
        "condition": "Good",
        "dailyPrice": 5000,
        "currency": "NGN",
        "image": "https://cloudinary.com/product-002.jpg",
        "images": ["https://cloudinary.com/product-002.jpg"],
        "rating": 4.5,
        "reviews": 15,
        "lister": {
          "id": "user_789",
          "name": "Luxury Rentals",
          "avatar": "https://cloudinary.com/lister-789.jpg",
          "rating": 4.7
        },
        "isInStock": true,
        "availableCount": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20
    }
  }
}
```

**Status Codes:**

- `200 OK` - Products retrieved successfully
- `400 Bad Request` - Invalid query parameters

---

### 2. GET /api/public/products/:productId

**Location:** `src/app/shop/product-details/page.tsx` (Product detail page)

**UX Explanation:**
Retrieve complete details for a single product/listing. Displayed on the product details page with:

- Product images (multiple photos)
- Detailed description
- Specifications (condition, size, measurements, color, composition)
- Lister information (name, profile, rating, shop reviews)
- Pricing (daily rate, security deposit if applicable)
- Availability status and quantity
- User reviews/ratings for the product
- Related products from same lister

**Request Format:**

```json
GET /api/public/products/prod_001
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_001",
      "name": "Vintage Gucci Handbag",
      "description": "Beautiful vintage Gucci handbag in excellent condition. Features the iconic GG pattern with leather handles.",
      "brand": {
        "id": "brand_001",
        "name": "Gucci"
      },
      "category": {
        "id": "cat_001",
        "name": "Bags"
      },
      "condition": "Excellent",
      "color": "Brown",
      "size": "Medium",
      "composition": "Leather, Canvas",
      "measurements": "30cm x 20cm x 15cm",
      "dailyPrice": 8500,
      "currency": "NGN",
      "securityDeposit": 15000,
      "images": [
        "https://cloudinary.com/product-001.jpg",
        "https://cloudinary.com/product-001-2.jpg",
        "https://cloudinary.com/product-001-3.jpg"
      ],
      "rating": 4.8,
      "reviewCount": 23,
      "isInStock": true,
      "availableCount": 1,
      "lister": {
        "id": "user_456",
        "name": "Vintage Chic",
        "avatar": "https://cloudinary.com/lister-456.jpg",
        "rating": 4.9,
        "reviewCount": 45,
        "shopDescription": "Specializing in vintage and designer luxury items",
        "joined": "2024-01-15T00:00:00Z"
      },
      "productReviews": [
        {
          "reviewId": "rev_001",
          "renterName": "Sarah M.",
          "rating": 5,
          "text": "Perfect item! Arrived in excellent condition exactly as described.",
          "date": "2026-01-20T00:00:00Z"
        },
        {
          "reviewId": "rev_002",
          "renterName": "Emma K.",
          "rating": 5,
          "text": "Great quality and fast delivery. Would rent again!",
          "date": "2026-01-15T00:00:00Z"
        }
      ],
      "relatedProducts": [
        {
          "id": "prod_003",
          "name": "Gucci Leather Wallet",
          "dailyPrice": 3000,
          "image": "https://cloudinary.com/product-003.jpg"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - Product details retrieved successfully
- `404 Not Found` - Product not found

---

### 3. GET /api/public/products/:productId/availability

**Location:** `src/app/shop/product-details/components/RentalDurationSelector.tsx` (Calendar component)

**UX Explanation:**
Retrieve available rental dates for a specific product. This endpoint powers the calendar in the RentalDurationSelector component, showing:

- Calendar of available dates for the next 60+ days
- Unavailable dates (already rented by other users)
- Available dates (can be selected)
- Price per day variations (optional: if prices change by season)
- Maximum consecutive rental days allowed

The frontend uses this data to:

- Block/gray out unavailable dates in calendar
- Highlight available dates as clickable
- Allow renters to select start and end dates
- Calculate rental cost based on selected duration

**Request Format:**

```json
GET /api/public/products/prod_001/availability?startDate=2026-02-10&endDate=2026-04-30
```

**Query Parameters:**

- `startDate` (optional): ISO date string for calendar start (default: today)
- `endDate` (optional): ISO date string for calendar end (default: 60 days from today)

**Response Format:**

```json
{
  "success": true,
  "data": {
    "availability": {
      "productId": "prod_001",
      "productName": "FENDI ARCO BOOTS",
      "dailyPrice": 55000,
      "currency": "NGN",
      "availableDates": [
        "2026-02-10",
        "2026-02-11",
        "2026-02-12",
        "2026-02-13",
        "2026-02-14",
        "2026-02-15",
        "2026-02-16",
        "2026-02-17",
        "2026-02-18",
        "2026-02-19",
        "2026-02-20"
      ],
      "unavailableDates": [
        "2026-02-22",
        "2026-02-23",
        "2026-02-24",
        "2026-02-25",
        "2026-02-26",
        "2026-03-10",
        "2026-03-11",
        "2026-03-12"
      ],
      "monthAvailability": {
        "2026-02": {
          "total": 28,
          "available": 20,
          "unavailable": 8,
          "percentAvailable": 71
        },
        "2026-03": {
          "total": 31,
          "available": 29,
          "unavailable": 2,
          "percentAvailable": 94
        },
        "2026-04": {
          "total": 30,
          "available": 30,
          "unavailable": 0,
          "percentAvailable": 100
        }
      },
      "calendarData": [
        {
          "date": "2026-02-10",
          "available": true,
          "dayOfWeek": "Tuesday",
          "bookedBy": null
        },
        {
          "date": "2026-02-11",
          "available": true,
          "dayOfWeek": "Wednesday",
          "bookedBy": null
        },
        {
          "date": "2026-02-22",
          "available": false,
          "dayOfWeek": "Sunday",
          "bookedBy": "user_123"
        }
      ],
      "minRentalDays": 1,
      "maxConsecutitiveDays": 30,
      "nextUnavailableFrom": "2026-02-22T00:00:00Z",
      "checkDateFrom": "2026-02-10T00:00:00Z",
      "checkDateTo": "2026-04-30T00:00:00Z"
    }
  }
}
```

**Status Codes:**

- `200 OK` - Availability retrieved successfully
- `400 Bad Request` - Invalid date range
- `404 Not Found` - Product not found

---

## Browse Brands

### 4. GET /api/public/brands

**Location:** `src/app/home/components/BrandLogosCarousel.tsx` (Brand logos carousel)

**UX Explanation:**
Retrieve all available luxury brands on the platform. Used to display a carousel of brand logos on the home page, allowing users to browse items by designer brand. Brands are typically luxury/designer labels.

**Request Format:**

```json
GET /api/public/brands
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": "brand_001",
        "name": "Gucci",
        "logo": "https://cloudinary.com/brands/gucci.png"
      },
      {
        "id": "brand_002",
        "name": "Louis Vuitton",
        "logo": "https://cloudinary.com/brands/lv.png"
      },
      {
        "id": "brand_003",
        "name": "Chanel",
        "logo": "https://cloudinary.com/brands/chanel.png"
      },
      {
        "id": "brand_004",
        "name": "Prada",
        "logo": "https://cloudinary.com/brands/prada.png"
      },
      {
        "id": "brand_005",
        "name": "Versace",
        "logo": "https://cloudinary.com/brands/versace.png"
      },
      {
        "id": "brand_006",
        "name": "Dior",
        "logo": "https://cloudinary.com/brands/dior.png"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Brands retrieved successfully

---

## Browse Categories

### 5. GET /api/public/categories

**Location:** `src/app/home/sections/PopularCategorySection.tsx` (Popular categories cards)

**UX Explanation:**
Retrieve all available fashion categories. Used to:

- Display 6 popular category cards on home page (Dresses, Shoes, Bags, Outerwear, Jewelry, Accessories)
- Create category filter options in shop
- Allow browsing by fashion category

Each category includes name, description, and optional image for display.

**Request Format:**

```json
GET /api/public/categories
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_001",
        "name": "Dresses",
        "description": "Elegant dresses for every occasion",
        "image": "https://cloudinary.com/categories/dresses.jpg",
        "itemCount": 234
      },
      {
        "id": "cat_002",
        "name": "Shoes",
        "description": "Designer footwear from luxury brands",
        "image": "https://cloudinary.com/categories/shoes.jpg",
        "itemCount": 187
      },
      {
        "id": "cat_003",
        "name": "Bags",
        "description": "Handbags and luxury accessories",
        "image": "https://cloudinary.com/categories/bags.jpg",
        "itemCount": 156
      },
      {
        "id": "cat_004",
        "name": "Outerwear",
        "description": "Coats, jackets, and blazers",
        "image": "https://cloudinary.com/categories/outerwear.jpg",
        "itemCount": 98
      },
      {
        "id": "cat_005",
        "name": "Jewelry",
        "description": "Luxury jewelry and watches",
        "image": "https://cloudinary.com/categories/jewelry.jpg",
        "itemCount": 112
      },
      {
        "id": "cat_006",
        "name": "Accessories",
        "description": "Scarves, belts, hats, and more",
        "image": "https://cloudinary.com/categories/accessories.jpg",
        "itemCount": 145
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Categories retrieved successfully

---

## Browse Listers/Curators

### 5. GET /api/public/users

**Location:**

- `src/app/home/sections/TopCuratorsSection.tsx` (Top curators/listers carousel)
- `src/app/listers-marketplace/page.tsx` (All listers directory with search)

**UX Explanation:**
Retrieve list of all active listers/curators on the platform. Used to:

- Display top listers in a carousel on home page (7+ featured litters)
- Show all listers in the Listers Marketplace with search/filter
- Allow renters to browse and discover curators
- Display lister ratings and shop information

**Request Format:**

```json
GET /api/public/users?page=1&limit=20&sort=rating&search=vintage
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `sort` (optional): "rating" | "newest" | "popularity" - default "rating"
- `search` (optional): Search by lister name
- `role` (optional): "lister" | "renter" - default "lister"

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "id": "user_001",
      "name": "Vintage Chic",
      "avatar": "https://cloudinary.com/users/user-001.jpg",
      "role": "lister",
      "rating": 4.9,
      "reviewCount": 45,
      "shopDescription": "Specializing in vintage and designer luxury items",
      "itemCount": 124,
      "joined": "2024-01-15T00:00:00Z",
      "isVerified": true,
      "featured": true
    },
    {
      "id": "user_002",
      "name": "Luxury Rentals",
      "avatar": "https://cloudinary.com/users/user-002.jpg",
      "role": "lister",
      "rating": 4.7,
      "reviewCount": 38,
      "shopDescription": "Premium luxury designer rentals",
      "itemCount": 87,
      "joined": "2024-02-10T00:00:00Z",
      "isVerified": true,
      "featured": true
    },
    {
      "id": "user_003",
      "name": "Style Curator",
      "avatar": "https://cloudinary.com/users/user-003.jpg",
      "role": "lister",
      "rating": 4.6,
      "reviewCount": 31,
      "shopDescription": "Curated selection of contemporary fashion",
      "itemCount": 56,
      "joined": "2024-03-05T00:00:00Z",
      "isVerified": true,
      "featured": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 47,
    "itemsPerPage": 20
  }
}
```

**Status Codes:**

- `200 OK` - Users/listers retrieved successfully
- `400 Bad Request` - Invalid query parameters

---

### 6. GET /api/public/users/:userId

**Location:** `src/app/lister-profile/[id]/page.tsx` (Lister profile page)

**UX Explanation:**
Retrieve detailed information about a specific lister/curator. Displayed on their public profile page with:

- Lister profile information (name, avatar, bio, shop description)
- Shop statistics (items listed, total rating, review count, joined date)
- Verification status (verified badge)
- Featured products from this lister
- Recent reviews from renters
- Shop policies and about information

**Request Format:**

```json
GET /api/public/users/user_001
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "name": "Vintage Chic",
      "avatar": "https://cloudinary.com/users/user-001.jpg",
      "role": "lister",
      "bio": "Passionate vintage fashion enthusiast curating the finest pieces",
      "shopDescription": "Specializing in vintage and designer luxury items. All items are authenticated and carefully inspected.",
      "rating": 4.9,
      "reviewCount": 45,
      "itemCount": 124,
      "joined": "2024-01-15T00:00:00Z",
      "isVerified": true,
      "verificationDate": "2024-01-20T00:00:00Z",
      "featured": true,
      "shopPolicies": {
        "returnPolicy": "Full refund within 30 days of rental",
        "deliveryTime": "2-3 business days",
        "cancellationPolicy": "Free cancellation up to 48 hours before rental"
      },
      "featuredProducts": [
        {
          "id": "prod_001",
          "name": "Vintage Gucci Handbag",
          "dailyPrice": 8500,
          "image": "https://cloudinary.com/product-001.jpg"
        },
        {
          "id": "prod_002",
          "name": "Hermes Scarf Silk",
          "dailyPrice": 3500,
          "image": "https://cloudinary.com/product-002.jpg"
        }
      ],
      "recentReviews": [
        {
          "reviewId": "rev_001",
          "renterName": "Sarah M.",
          "rating": 5,
          "text": "Excellent service! Item was perfectly packaged and arrived on time.",
          "date": "2026-01-20T00:00:00Z"
        },
        {
          "reviewId": "rev_002",
          "renterName": "Emma K.",
          "rating": 5,
          "text": "Very professional. Item condition exactly as described.",
          "date": "2026-01-15T00:00:00Z"
        }
      ]
    }
  }
}
```

**Status Codes:**

- `200 OK` - User details retrieved successfully
- `404 Not Found` - User not found

---

### 7. GET /api/public/users/:userId/products

**Location:** `src/app/lister-profile/[id]/components/NewListingsSection.tsx` (Items tab on lister profile)

**UX Explanation:**
Retrieve all products/listings from a specific lister. Used to display:

- **Items Tab** on lister profile page showing all their listed products
- Filterable/searchable product grid from the curator
- Product cards with images, prices, ratings, and availability
- Supports pagination for large product collections

**Request Format:**

```json
GET /api/public/users/user_001/products?page=1&limit=20&sort=newest&category=Dresses
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `sort` (optional): "newest" | "price_low" | "price_high" | "rating" - default "newest"
- `category` (optional): Filter by category
- `search` (optional): Search within lister's products

**Response Format:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Vintage Gucci Handbag",
        "brand": "Gucci",
        "category": "Bags",
        "dailyPrice": 8500,
        "image": "https://cloudinary.com/product-001.jpg",
        "rating": 4.8,
        "reviews": 23,
        "isInStock": true
      },
      {
        "id": "prod_002",
        "name": "Hermes Scarf Silk",
        "brand": "Hermes",
        "category": "Accessories",
        "dailyPrice": 3500,
        "image": "https://cloudinary.com/product-002.jpg",
        "rating": 4.9,
        "reviews": 15,
        "isInStock": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 28,
      "itemsPerPage": 20
    }
  }
}
```

**Status Codes:**

- `200 OK` - Lister products retrieved successfully
- `404 Not Found` - Lister not found

---

### 8. GET /api/public/users/:userId/reviews

**Location:** `src/app/lister-profile/[id]/components/DetailedReview.tsx` (Reviews tab on lister profile)

**UX Explanation:**
Retrieve all customer reviews and ratings for a specific lister. Used to display:

- **Reviews Tab** on lister profile showing all customer testimonials
- Individual review cards with customer name, avatar, rating, comment, date
- "Most Helpful" badge for top reviews
- Complete review history with pagination

**Request Format:**

```json
GET /api/public/users/user_001/reviews?page=1&limit=10&sort=newest
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Reviews per page, default 10
- `sort` (optional): "newest" | "oldest" | "rating_high" | "rating_low" - default "newest"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_001",
        "name": "Sarah Mitchell",
        "avatarUrl": "https://cloudinary.com/reviews/sarah-mitchell.jpg",
        "rating": 5,
        "comment": "Excellent service! Item was perfectly packaged and arrived on time.",
        "date": "2026-01-20T00:00:00Z",
        "isMostHelpful": true
      },
      {
        "id": "rev_002",
        "name": "Emma Kingsley",
        "avatarUrl": "https://cloudinary.com/reviews/emma-kingsley.jpg",
        "rating": 5,
        "comment": "Very professional. Item condition exactly as described. Would rent again!",
        "date": "2026-01-15T00:00:00Z",
        "isMostHelpful": false
      },
      {
        "id": "rev_003",
        "name": "Jessica Chen",
        "avatarUrl": "https://cloudinary.com/reviews/jessica-chen.jpg",
        "rating": 4,
        "comment": "Great quality items and responsive communication.",
        "date": "2026-01-10T00:00:00Z",
        "isMostHelpful": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 28,
      "itemsPerPage": 10
    },
    "summary": {
      "totalReviews": 28,
      "averageRating": 4.8,
      "fiveStarCount": 24
    }
  }
}
```

**Status Codes:**

- `200 OK` - Lister reviews retrieved successfully
- `404 Not Found` - Lister not found

---

## Customer Reviews (Global)

### 9. GET /api/public/reviews

**Location:** `src/app/home/sections/ReviewCarousel.tsx` (5-star reviews carousel)

**UX Explanation:**
Retrieve high-quality reviews/testimonials from the platform. Used to display:

- **Review Carousel** on home page with 5-star customer testimonials
- **Reviews Header**: "Join 100,000+ Happy Members" with 5.0 ★★★★★ rating
- **Review Cards**: Customer name, role/profile, review text, customer photo
- **Multiple views**: Small cards (left/right side), main featured card (center)
- Social proof showing renter satisfaction

Typically filtered to show only 5-star reviews for social proof purposes.

**Request Format:**

```json
GET /api/public/reviews?minRating=5&limit=10&sort=newest
```

**Query Parameters:**

- `minRating` (optional): Minimum rating (1-5), default 5
- `limit` (optional): Number of reviews to return, default 10
- `sort` (optional): "newest" | "oldest" | "helpful" - default "newest"
- `type` (optional): "product" | "lister" | "general" - default "general"

**Response Format:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_001",
        "name": "Sarah Mitchell",
        "role": "Fashion Blogger",
        "rating": 5,
        "text": "RELISTED has completely transformed how I access luxury fashion! The curation is impeccable and shipping is incredibly fast.",
        "image": "https://cloudinary.com/reviews/sarah-mitchell.jpg",
        "date": "2026-01-20T00:00:00Z",
        "verified": true
      },
      {
        "id": "rev_002",
        "name": "Emma Kingsley",
        "role": "Stylist",
        "rating": 5,
        "text": "Best platform for sustainable luxury fashion. Amazing selection and even better prices than I expected!",
        "image": "https://cloudinary.com/reviews/emma-kingsley.jpg",
        "date": "2026-01-15T00:00:00Z",
        "verified": true
      },
      {
        "id": "rev_003",
        "name": "Jessica Chen",
        "role": "Designer",
        "rating": 5,
        "text": "As someone who values sustainability, RELISTED is a game-changer. Quality pieces, authentic brands, 100% satisfied!",
        "image": "https://cloudinary.com/reviews/jessica-chen.jpg",
        "date": "2026-01-10T00:00:00Z",
        "verified": true
      },
      {
        "id": "rev_004",
        "name": "Michael Rodriguez",
        "role": "Creative Director",
        "rating": 5,
        "text": "The variety and quality of pieces is outstanding. Every item I've rented has been in pristine condition.",
        "image": "https://cloudinary.com/reviews/michael-rodriguez.jpg",
        "date": "2026-01-05T00:00:00Z",
        "verified": true
      },
      {
        "id": "rev_005",
        "name": "Amanda Brooks",
        "role": "Entrepreneur",
        "rating": 5,
        "text": "Finally a platform that delivers luxury fashion rentals with integrity and style. Highly recommend!",
        "image": "https://cloudinary.com/reviews/amanda-brooks.jpg",
        "date": "2025-12-30T00:00:00Z",
        "verified": true
      }
    ],
    "summary": {
      "totalReviews": 10000,
      "averageRating": 5.0,
      "fiveStarCount": 9500,
      "verified_reviews_percentage": 95
    }
  }
}
```

**Status Codes:**

- `200 OK` - Reviews retrieved successfully

---

## Search & Recommendations

### 10. GET /api/public/search

**Location:** `src/app/shop/components/Filters.tsx` (Search input in shop page)

**UX Explanation:**
Global search across products, brands, and listers. Used for:

- Product search by name/brand/lister
- Auto-suggest/search-as-you-type
- Full-text search with relevance ranking
- Finds items based on multiple criteria

**Request Format:**

```json
GET /api/public/search?query=gucci&type=product&limit=10
```

**Query Parameters:**

- `query` (required): Search term
- `type` (optional): "product" | "brand" | "lister" | "all" - default "all"
- `limit` (optional): Number of results, default 10

**Response Format:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "product",
        "id": "prod_001",
        "name": "Vintage Gucci Handbag",
        "image": "https://cloudinary.com/product-001.jpg",
        "lister": "Vintage Chic",
        "price": 8500
      },
      {
        "type": "brand",
        "id": "brand_001",
        "name": "Gucci",
        "image": "https://cloudinary.com/brands/gucci.png"
      },
      {
        "type": "lister",
        "id": "user_002",
        "name": "Gucci Specialist Store",
        "avatar": "https://cloudinary.com/users/user-002.jpg"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Search results retrieved successfully
- `400 Bad Request` - Missing query parameter

---

## Style Spotlight Page

**Location:** `src/app/style-spotlight/page.tsx`

**Page Overview:**
The Style Spotlight page showcases all available fashion categories and active listers/curators on the platform. It serves as a discovery page for renters to explore different style categories and meet featured curators.

**Components Overview:**

### StyleSpotlightHero

- Static hero section with background image and title
- No endpoints required

### MeetCuratorsSection

Uses: **GET /api/public/users**

- Displays carousel of all active listers/curators
- Shows curator name, avatar, and number of listings
- Allows browsing individual curator profiles
- Features scroll controls (left/right navigation)

**Used in:** `src/app/style-spotlight/sections/MeetCuratorsSection.tsx`

### StyleCategoriesSection

Uses: **GET /api/public/categories**

- Displays grid of all fashion style categories (Dresses, Shoes, Bags, Outerwear, Jewelry, Accessories)
- Shows category image, title, description
- Allows browsing items by category
- Responsive grid layout (1 col on mobile, 2 cols on tablet, 3 cols on desktop)

**Used in:** `src/app/style-spotlight/sections/StyleCategoriesSection.tsx`

### BecomeCuratorSection

- Call-to-action section for becoming a curator
- Static content with benefits and link to curator signup
- No endpoints required

---

## Contact & Support

### 11. POST /api/public/contact-us

**Location:** `src/app/contact-us/sections/ContactSection.tsx` (Contact form submission)

**UX Explanation:**
Submit a contact message to the RELISTED platform support team. Used when:

- Renters or guests want to get in touch with customer support
- Inquiries about rentals, issues, or general questions
- Contact form on Contact Us page with fields for name, email, and message
- After successful submission, show confirmation message

**Request Format:**

```json
POST /api/public/contact-us

{
  "firstName": "Sarah",
  "lastName": "Mitchell",
  "email": "sarah.mitchell@email.com",
  "message": "I have a question about my rental order and would like assistance."
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you within 24 hours.",
  "data": {
    "ticketId": "TKT-001",
    "submittedAt": "2026-02-08T14:30:00Z",
    "status": "received"
  }
}
```

**Status Codes:**

- `201 Created` - Contact message submitted successfully
- `400 Bad Request` - Missing required fields (firstName, lastName, email, message)
- `422 Unprocessable Entity` - Invalid email format
- `429 Too Many Requests` - Rate limit exceeded (max 5 messages per hour)

---

## FAQ Section

**Location:** `src/app/contact-us/sections/FAQSection.tsx`

**UX Explanation:**
Display frequently asked questions about the RELISTED platform. This uses static data from application data files (`@/data/faqsData`) and does not require any API endpoints.

**Features:**

- Expandable/collapsible accordion-style FAQ items
- Smooth animations on expand/collapse
- Covers common questions about rentals, shipping, returns, policies
- Search-friendly read-only content

**No API Endpoints Required** - FAQ content is pre-loaded from static data.

---

## Status Tracking

- [ ] GET /api/public/products
- [ ] GET /api/public/products/:productId
- [ ] GET /api/public/brands
- [ ] GET /api/public/categories
- [ ] GET /api/public/users
- [ ] GET /api/public/users/:userId
- [ ] GET /api/public/users/:userId/products
- [ ] GET /api/public/users/:userId/reviews
- [ ] GET /api/public/reviews
- [ ] GET /api/public/search
- [ ] POST /api/public/contact-us

**Total Endpoints: 11**

**Once endpoints are created:** Remove completed items from this file and move them to connection phase.
