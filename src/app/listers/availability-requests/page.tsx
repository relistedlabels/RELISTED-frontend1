import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2 } from "@/common/ui/Text";
import OrdersManagement from "../components/OrdersManagement";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Availability Requests", href: null },
  ];

  return (
    <DashboardLayout>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />
      </div>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Availability Requests</Paragraph2>
      </div>
      <div>
        <OrdersManagement availabilityRequestsOnly />
      </div>
    </DashboardLayout>
  );
}
