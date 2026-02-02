import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import { Paragraph2 } from "@/common/ui/Text";
import DashboardLayout from "../../components/DashboardLayout";
import BackHeader from "@/common/ui/BackHeader";
import OrderDetailsCard from "../../components/OrderDetailsCard";
import OrderItemList from "../../components/OrderItemList";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Orders", href: "/listers/orders" },
    { label: "Orders Details", href: null }, // Current page, href is null
  ];
  return (
    <DashboardLayout>
      <div className=" mb-4  ">
        <Breadcrumbs items={path} />{" "}
      </div>{" "}
      <div className=" mb-4  ">
        <BackHeader title="Order Details" subtitle="View rental information" />
      </div>
      <div>
        <OrderDetailsCard />
      </div>
      <div>
        <OrderItemList />
      </div>
    </DashboardLayout>
  );
}
