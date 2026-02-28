// app/listers/orders/[orderId]/page.tsx
// ENDPOINTS: GET /api/listers/orders/:orderId, GET /api/listers/orders/:orderId/items, GET /api/listers/orders/:orderId/progress, POST /api/listers/orders/:orderId/approve, POST /api/listers/orders/:orderId/reject, PUT /api/listers/orders/:orderId/status

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../../components/DashboardLayout";
import BackHeader from "@/common/ui/BackHeader";
import OrderDetailsCard from "../../components/OrderDetailsCard";
import OrderItemList from "../../components/OrderItemList";

interface PageProps {
  params: {
    orderId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { orderId } = params;
  console.log("Order page orderId (final):", orderId);

  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Orders", href: "/listers/orders" },
    { label: `Order Details`, href: null },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>     

      <div>
        <OrderDetailsCard orderId={orderId} />
      </div>

     
    </DashboardLayout>
  );
}
