// ENDPOINTS: GET /api/listers/disputes/stats, GET /api/listers/disputes (list)
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2, Paragraph3 } from "@/common/ui/Text";
import ExampleDisputesDashboard from "../components/DisputesDashboard";
import ExampleDisputesListTable from "../components/DisputesListTable";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Dispute", href: null }, // Current page, href is null
  ];
  return (
    <DashboardLayout>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Breadcrumbs items={path} />{" "}
      </div>
      <div className=" mb-4 px-4 sm:px-0 ">
        <Paragraph2>Dispute</Paragraph2>{" "}
      </div>
      <div>
        <ExampleDisputesDashboard />
        <ExampleDisputesListTable />
      </div>
    </DashboardLayout>
  );
}
