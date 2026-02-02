import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { Paragraph2, Paragraph3 } from "@/common/ui/Text";
import WalletBalanceCard from "../components/WalletBalanceCard";
import TransactionList from "../components/TransactionList";
import ExampleDisputesDashboard from "@/app/dressers/components/DisputesDashboard";
import ExampleDisputesListTable from "@/app/dressers/components/DisputesListTable";

export default function Page() {
  const path = [
    { label: "Dashboard", href: "/curators/dashboard" },
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
