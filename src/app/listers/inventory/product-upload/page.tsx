import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../../components/DashboardLayout";
import UploadItemHeader from "../../components/UploadItemHeader";
import { ItemImageUploader } from "../../components/ItemImageUploader";
import { BasicInformationForm } from "../../components/BasicInformationForm";
import { TagSelector } from "../../components/TagSelector";
import { ItemDescription } from "../../components/ItemDescription";

export default function Page() {
  const path = [
    // { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Dashboard", href: "#" },
    { label: "Inventory", href: "/listers/inventory" },
    { label: "New Item", href: null },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4  ">
        <Breadcrumbs items={path} />
      </div>
      <div>
        <UploadItemHeader />
      </div>
      <div>
        <ItemImageUploader />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <BasicInformationForm />
        <div className="space-y-4">
          <TagSelector />
          <ItemDescription />
        </div>
      </div>
    </DashboardLayout>
  );
}
