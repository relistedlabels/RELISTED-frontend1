// ENDPOINTS: GET/PUT /api/admin/shop-settings/visible-brands, GET/PUT /api/admin/shop-settings/prioritized-brands, POST /brands
"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import ShopBrandVisibilityPanel from "./components/ShopBrandVisibilityPanel";
import ShopBrandPriorityPanel from "./components/ShopBrandPriorityPanel";

export default function AdminShopPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Brands
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Manage which brands appear on the site and how they are ordered on the
          shop page.
        </Paragraph1>
      </div>

      <div className="space-y-6">
        <ShopBrandVisibilityPanel />
        <ShopBrandPriorityPanel />
      </div>
    </div>
  );
}
