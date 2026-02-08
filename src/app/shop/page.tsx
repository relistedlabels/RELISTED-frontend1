import React from "react";
import EndlessStyleHero from "./sections/EndlessStyleHero";
import NewListingsSection from "./sections/NewListingsSection";

// ============================================================================
// API ENDPOINTS USED:
// ============================================================================
// GET /api/public/products - Fetch all available products with filters/search
//   Location: NewListingsSection component
//   Query Params: category, brand, gender, minPrice, maxPrice, search, sort, page, limit
// ============================================================================

export default function page() {
  return (
    <div>
      <EndlessStyleHero />
      <NewListingsSection />
    </div>
  );
}
