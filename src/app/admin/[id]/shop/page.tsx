// ENDPOINTS: GET/PUT /api/admin/shop-settings/visible-brands, GET/PUT /api/admin/shop-settings/prioritized-brands, POST /brands
"use client";

import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import ShopBrandPriorityPanel from "./components/ShopBrandPriorityPanel";
import ShopBrandVisibilityPanel from "./components/ShopBrandVisibilityPanel";

export default function AdminShopPage() {
  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Brands"
        description="Manage visible brands and shop order."
      />

      <div className="space-y-6">
        <ShopBrandVisibilityPanel />
        <ShopBrandPriorityPanel />
      </div>
    </div>
  );
}
