// ENDPOINTS: GET /api/listers/orders (list with pagination & filters), POST /api/listers/orders/:orderId/approve, POST /api/listers/orders/:orderId/reject
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2 } from "@/common/ui/Text";
import OrdersManagement from "../components/OrdersManagement";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Orders", href: null }, // Current page, href is null
  ];
  return (
    <DashboardLayout>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>{" "}
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Order</Paragraph2>{" "}
      </div>
      <div>
        <OrdersManagement />
      </div>
    </DashboardLayout>
  );
}
