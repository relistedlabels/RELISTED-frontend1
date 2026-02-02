import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import InventoryList from "../components/InventoryList";


export default function Page() {
    const path = [
      // { label: "Dashboard", href: "/listers/dashboard" },
      { label: "Dashboard", href: "#" },
      { label: "Inventory", href: null },
    ];
  
  return (
    <DashboardLayout>
      <div className=" mb-4  ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <InventoryList />
    </DashboardLayout>
  );
}
