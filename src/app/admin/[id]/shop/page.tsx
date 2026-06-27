// ENDPOINTS: GET /api/admin/shop-settings/prioritized-brands, PUT /api/admin/shop-settings/prioritized-brands, GET /brands
"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import ShopBrandPriorityPanel from "./components/ShopBrandPriorityPanel";

export default function AdminShopPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Shop
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Configure how the public shop page is organized and presented.
        </Paragraph1>
      </div>

      <ShopBrandPriorityPanel />
    </div>
  );
}
