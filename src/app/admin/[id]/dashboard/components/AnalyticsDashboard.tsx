// ENDPOINTS: GET /api/admin/analytics/rentals-revenue-trend, GET /api/admin/analytics/category-breakdown, GET /api/admin/analytics/revenue-by-category
// AnalyticsDashboard.tsx
"use client";

import React from "react";
import RentalsRevenueTrend from "./RentalsRevenueTrend";
import CategoryBreakdown from "./CategoryBreakdown";
import RevenueByCategory from "./RevenueByCategory";

const AnalyticsDashboard = () => {
  return (
    <div className="mt-6 min-h-screen">
      {/* The first chart spans 1 column on medium screens */}
      <div className="col-span-1">
        <RentalsRevenueTrend />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
        {/* The second chart spans 1 column */}
        <div className="col-span-1">
          <CategoryBreakdown />
        </div>
        {/* The third chart spans 1 column */}
        <div className="col-span-1">
          <RevenueByCategory />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
